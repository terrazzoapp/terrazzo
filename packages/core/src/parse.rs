extern crate json;
extern crate yaml_rust;
use lazy_static::lazy_static;
use regex::Regex;
use std::collections::{HashMap, HashSet};
use yaml_rust::{Yaml, YamlLoader};

// TODO: validate modes

lazy_static! {
    static ref HEX_RE: Regex = Regex::new(r"^#[0-9A-Fa-f]{3,8}$").unwrap();
    static ref URL_RE: Regex = Regex::new(r"^(http://|https://|//)").unwrap();
    static ref ALIAS_RE: Regex = Regex::new(r"^\$").unwrap();
}

// convert tokens.yaml into JSON string
pub fn parse_and_validate(raw_schema: &String) -> String {
    let mut schema = json::object! {
        result: json::object!{
            metadata: json::JsonValue::new_object(),
            tokens: json::JsonValue::new_array(),
        },
        errors: json::JsonValue::new_array()
    };

    let yaml_docs = YamlLoader::load_from_str(&raw_schema);

    // 0. if scan error, return error & exit
    match yaml_docs {
        Err(e) => {
            schema["errors"].push(format!("YAML parse error: {}", e));
            return schema.dump();
        }
        _ => {}
    }
    let yaml = &yaml_docs.unwrap()[0];

    // 1. validate top-level keys
    for (raw_k, raw_v) in yaml.as_hash().unwrap() {
        let k = raw_k.as_str().unwrap();
        match k {
            "name" | "version" | "metadata" => {
                schema["result"]["metadata"][k] = json_serialize(raw_v);
            }
            "tokens" => {
                if raw_v.as_hash().is_some() {
                    if raw_v.as_hash().unwrap().keys().len() == 0 {
                        schema["errors"].push("\"tokens\" is empty!");
                    }
                } else {
                    schema["errors"].push("invalid \"tokens\" format");
                }
            }
            _ => {
                let msg = format!(
                    "Invalid top-level name \"{}\". Place arbitrary data inside \"metadata\"",
                    k,
                );
                schema["errors"].push(msg);
            }
        }
    }
    if is_empty(&yaml["tokens"]) {
        schema["errors"].push("\"tokens\" is empty!");
    }
    if schema["errors"].len() > 0 {
        return schema.dump();
    }

    // 2. iterate through tokens
    fn walk(node: &Yaml, id: &String, obj: &mut json::JsonValue) {
        // group
        if is_empty(&node["type"]) || node["type"].as_str().is_none() {
            if node.as_hash().is_some() {
                for (k, v) in node.as_hash().unwrap() {
                    let next_id = format!("{}.{}", id, k.as_str().unwrap());
                    walk(v, &next_id, obj);
                }
            } else {
                obj["errors"].push(json::from(format!("syntax error on group \"{}\"", id)));
            }
        }
        // token
        else {
            let token = match node["type"].as_str().unwrap() {
                "color" => parse_color(node, id),
                "dimension" => parse_dimension(node, id),
                "font" => parse_font(node, id),
                "cubic-bezier" => parse_cubic_bezier(node, id),
                "file" => parse_str(node, id),
                "url" => parse_url(node, id),
                "shadow" => parse_shadow(node, id),
                "linear-gradient" => parse_str(node, id),
                "radial-gradient" => parse_str(node, id),
                "conic-gradient" => parse_str(node, id),
                _ => parse_str(node, id),
            };
            match token {
                Err(msgs) => {
                    for e in msgs {
                        obj["errors"].push(json::from(e));
                    }
                }
                Ok(t) => {
                    obj["result"]["tokens"].push(t);
                }
            }
        }
    }

    for (k, v) in yaml["tokens"].as_hash().unwrap() {
        walk(v, &k.as_str().unwrap().to_owned(), &mut schema);
    }

    if schema["errors"].len() > 0 {
        return schema.dump();
    }

    // 3. TODO: validate modes

    // 4. validate aliases
    let mut aliases: HashMap<String, String> = HashMap::new();
    fn follow_aliases(
        original_id: &String,
        next_node: &json::JsonValue,
        resolved: &mut HashMap<String, String>,
        scanned: &mut HashSet<String>,
        schema: &json::JsonValue,
    ) -> Result<String, Vec<String>> {
        // if already resolved, exit
        let id = next_node["id"].as_str().unwrap().to_owned();
        if resolved.contains_key(&id) {
            return Ok(resolved.get(&id).unwrap().to_owned());
        }

        // if this isn’t an alias, exit
        if next_node["value"].as_str().is_none()
            || !ALIAS_RE.is_match(next_node["value"].as_str().unwrap())
        {
            resolved.insert(original_id.to_owned(), id.to_owned());
            return Ok(id.to_owned());
        }

        let mut errors: Vec<String> = Vec::new();
        let alias = next_node["value"].as_str().unwrap().to_owned();
        let alias_id = &alias[1..alias.len()];

        // exit if missing alias
        let mut aliased: &json::JsonValue = &json::Null;
        for token in schema["result"]["tokens"].members() {
            if token["id"].as_str().unwrap() == alias_id {
                aliased = token;
                break;
            }
        }
        if aliased.is_null() {
            errors.push(format!("{}: {} not found", id, alias));
            return Err(errors.to_owned());
        }

        // exit if type mismatch
        if next_node["type"].as_str().unwrap() != aliased["type"].as_str().unwrap() {
            errors.push(format!(
                "{}: can’t use {} value for {}",
                id,
                aliased["type"].as_str().unwrap(),
                next_node["type"].as_str().unwrap()
            ));
            return Err(errors.to_owned());
        }

        // exit if circular reference
        if scanned.get(&id).is_some() {
            errors.push(format!(
                "{}: can’t reference circular alias {}",
                id.to_owned(),
                alias
            ));
            return Err(errors.to_owned());
        }

        // if next node is another alias, continue scanning
        if aliased["value"].as_str().is_some()
            && ALIAS_RE.is_match(&aliased["value"].as_str().unwrap())
        {
            scanned.insert(id); // prevent infinite loop
            return follow_aliases(original_id, aliased, resolved, scanned, schema);
        }

        // otherwise, finish & resolve
        resolved.insert(original_id.to_owned(), alias_id.to_owned());
        return Ok(alias_id.to_owned());
    }
    for token in schema["result"]["tokens"].members() {
        let mut scanned: HashSet<String> = HashSet::new();
        match follow_aliases(
            &token["id"].as_str().unwrap().to_owned(),
            token,
            &mut aliases,
            &mut scanned,
            &schema,
        ) {
            Ok(_) => {
                // aliases are valid! do nothing
            }
            Err(errors) => {
                for msg in errors {
                    schema["errors"].push(msg);
                }
                return schema.dump();
            }
        }
    }

    return schema.dump();
}

// convert Yaml to Json
pub fn json_serialize(node: &Yaml) -> json::JsonValue {
    if is_empty(node) {
        return json::from("null");
    }
    if node.is_array() {
        let mut items = json::JsonValue::new_array();
        for v in node.as_vec().unwrap() {
            items.push(json_serialize(v));
        }
        return items;
    }
    if node.as_hash().is_some() {
        let mut obj = json::JsonValue::new_object();
        for (k, v) in node.as_hash().unwrap() {
            obj[k.as_str().unwrap().to_owned()] = json_serialize(v);
        }
        return obj;
    }
    if node.as_i64().is_some() {
        return json::from(node.as_i64().unwrap());
    }
    if node.as_bool().is_some() {
        return json::from(node.as_bool().unwrap());
    }
    if node.as_str().is_some() {
        return json::from(node.as_str().unwrap());
    }
    return json::from("JSON ERROR"); // shouldn’t ever see this
}

pub fn parse_color(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap(),
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else if !is_empty(&data["value"]) {
        let c = data["value"].as_str().unwrap();
        if HEX_RE.is_match(&c) {
            token["value"] = json_serialize(&data["value"]);
        } else {
            errors.push(format!("{}: invalid hex \"{}\"", id, &c));
        }
    } else {
        errors.push(format!("{}: missing value", id));
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            let c = v.as_str().unwrap().trim().to_owned();
            if !HEX_RE.is_match(&c) {
                errors.push(format!("{}: invalid hex \"{}\"", id, &c));
            }
            token["mode"][k.as_str().unwrap().to_owned()] = json_serialize(v);
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

pub fn parse_dimension(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap(),
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"])
    } else if !is_empty(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else {
        errors.push(format!("{}: missing value", id));
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            token["mode"][k.as_str().unwrap()] = json_serialize(v);
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

pub fn parse_font(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap(),
        value: json::JsonValue::new_array(),
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else if !is_empty(&data["value"]) {
        // make sure token["value"] is always an array (data doesn’t have to be)
        if data["value"].is_array() {
            token["value"] = json_serialize(&data["value"]);
        } else {
            token["value"].push(json_serialize(&data["value"]));
        }
    } else {
        errors.push(format!("{}: missing value", id));
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            if v.is_array() {
                token["mode"][k.as_str().unwrap()] = json_serialize(v);
            } else {
                token["mode"][k.as_str().unwrap()].push(json_serialize(v));
            }
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

fn parse_cubic_bezier(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap(),
        value: json::JsonValue::new_array(),
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else if !is_empty(&data["value"]) {
        match parse_cubic_bezier_item(&data["value"], id) {
            Err(msgs) => {
                for e in msgs {
                    errors.push(e);
                }
            }
            Ok(v) => token["value"] = v,
        }
    } else {
        errors.push(format!("{}: missing value", id));
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            match parse_cubic_bezier_item(v, id) {
                Err(msgs) => {
                    for e in msgs {
                        errors.push(e);
                    }
                }
                Ok(b) => token["mode"][k.as_str().unwrap()] = b,
            }
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

fn parse_cubic_bezier_item(value: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut cubic_bezier = json::JsonValue::new_array();
    if value.is_array() && value.as_vec().unwrap().len() == 4 {
        for (i, v) in value.as_vec().unwrap().iter().enumerate() {
            let mut num = 0.0;
            if v.as_f64().is_some() {
                num = v.as_f64().unwrap();
            } else if v.as_i64().is_some() {
                num = v.as_i64().unwrap() as f64;
            } else {
                let pos = ["x1", "y1", "x2", "y2"][i];
                errors.push(format!("{}: expected number for {}", id, pos));
                continue;
            }
            let is_x = i == 0 || i == 2;
            if is_x && (num < 0.0 || num > 1.0) {
                errors.push(format!(
                    "{}: x values must be between 0 and 1, received \"{}\"",
                    id, &num,
                ));
            }
            cubic_bezier.push(json::from(num));
        }
    } else {
        errors.push(format!("{}: expected format [x1, y1, x2, y2]", id));
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(cubic_bezier)
    };
}

pub fn parse_str(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap()
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else if !is_empty(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else {
        errors.push(format!("{}: missing value", id));
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            token["mode"][k.as_str().unwrap()] = json_serialize(v);
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

pub fn parse_url(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap()
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else if !is_empty(&data["value"]) {
        let v = data["value"].as_str().unwrap();
        if URL_RE.is_match(v) {
            token["value"] = json_serialize(&data["value"]);
        } else {
            errors.push(format!(
                "{}: invalid URL: \"{}\" (for relative files, use \"type: file\" instead)",
                id, v,
            ));
        }
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            let url = v.as_str().unwrap();
            if URL_RE.is_match(url) {
                token["mode"][k.as_str().unwrap()] = json_serialize(v);
            } else {
                errors.push(format!(
                    "{}: invalid URL: \"{}\" (for relative files, use \"type: file\" instead)",
                    id, url,
                ));
            }
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

pub fn parse_shadow(data: &Yaml, id: &String) -> Result<json::JsonValue, Vec<String>> {
    let mut errors: Vec<String> = Vec::new();
    let mut token = json::object! {
        id: id.to_owned(),
        "type": data["type"].as_str().unwrap()
    };
    if is_alias(&data["value"]) {
        token["value"] = json_serialize(&data["value"]);
    } else if !is_empty(&data["value"]) {
        if data["value"].is_array() {
            token["value"] = json_serialize(&data["value"]);
        } else {
            errors.push(format!(
                "{}: value must be array, received \"{}\"",
                id,
                json_serialize(&data["value"])
            ));
        }
    } else {
        errors.push(format!("{}: missing value", id));
    }
    if !is_empty(&data["mode"]) {
        token["mode"] = json::JsonValue::new_object();
        for (k, v) in data["mode"].as_hash().unwrap() {
            if v.is_array() {
                token["mode"][k.as_str().unwrap()] = json_serialize(v)
            } else {
                errors.push(format!(
                    "{}: value must be array, received \"{}\"",
                    id,
                    json_serialize(v)
                ));
            }
        }
    }
    return if errors.len() > 0 {
        Err(errors)
    } else {
        Ok(token)
    };
}

fn is_alias(data: &Yaml) -> bool {
    if !is_empty(data) && data.as_str().is_some() && ALIAS_RE.is_match(data.as_str().unwrap()) {
        return true;
    }
    return false;
}

fn is_empty(data: &Yaml) -> bool {
    return data.is_null() || data.is_badvalue();
}
