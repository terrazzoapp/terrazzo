use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE", tag = "type")]
pub enum Node {
    Canvas(Canvas),
    Component(Component),
    ComponentSet(ComponentSet),
    Ellipse(Ellipse),
    Frame(Frame),
    Group(Group),
    Instance(Instance),
    Line(Line),
    Rectangle(Rectangle),
    RegularPolygon(RegularPolygon),
    Slice(Slice),
    Star(Star),
    Text(Text),
    Vector(Vector),
}

#[derive(Deserialize, Serialize)]
pub struct BoundingBox {
    height: f64,
    width: f64,
    x: f64,
    y: f64,
}

#[derive(Deserialize, Serialize)]
pub struct Color {
    r: f32,
    g: f32,
    b: f32,
    a: f32,
}
impl Color {
    fn to_hex(&self) -> String {
        let mut hex = format!(
            "#{:x}{:x}{:x}{:x}",
            (self.r * 255.0) as u8,
            (self.g * 255.0) as u8,
            (self.b * 255.0) as u8,
            (self.a * 255.0) as u8
        );
        return hex;
    }
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Canvas {
    id: String,
    r#type: String,
    name: String,
    background_color: Color,
    children: Vec<Node>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    corner_radius: f64,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: f64,
    rectangle_corner_radii: [f64; 4],
    strokes: Vec<Paint>,
    stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ComponentSet {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    corner_radius: f64,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: f64,
    rectangle_corner_radii: [f64; 4],
    strokes: Vec<Paint>,
    stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Ellipse {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: Option<f64>,
    strokes: Vec<Paint>,
    stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
    stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Frame {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    corner_radius: f64,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: f64,
    rectangle_corner_radii: [f64; 4],
    strokes: Vec<Paint>,
    stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Group {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    corner_radius: f64,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: f64,
    rectangle_corner_radii: [f64; 4],
    strokes: Vec<Paint>,
    stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Instance {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    corner_radius: f64,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: f64,
    rectangle_corner_radii: [f64; 4],
    strokes: Vec<Paint>,
    stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Line {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    corner_radius: f64,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: f64,
    rectangle_corner_radii: [f64; 4],
    strokes: Vec<Paint>,
    stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Rectangle {
    id: String,
    r#type: String,
    name: String,
    corner_radius: f64,
    rectangle_corner_radii: [f64; 4],
    fills: Vec<Paint>,
    opacity: Option<f64>,
    strokes: Vec<Paint>,
    stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
    stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegularPolygon {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: Option<f64>,
    strokes: Vec<Paint>,
    stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
    stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Slice {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    children: Vec<Node>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Star {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: Option<f64>,
    strokes: Vec<Paint>,
    stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
    stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Text {
    id: String,
    r#type: String,
    name: String,
    style: TypeStyle,
    fills: Vec<Paint>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Vector {
    id: String,
    r#type: String,
    name: String,
    absolute_bounding_box: BoundingBox,
    children: Vec<Node>,
    fills: Vec<Paint>,
    opacity: Option<f64>,
    strokes: Vec<Paint>,
    stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
    stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
    stroke_weight: f64,
}

#[derive(Deserialize, Serialize)]
pub struct ColorStop {
    position: f64,
    color: Color,
}

#[derive(Deserialize, Serialize)]
pub struct Coord {
    x: f64,
    y: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    children: Vec<Node>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Paint {
    r#type: String, // "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND" | "IMAGE" | "EMOJI"
    opacity: Option<f32>,
    visible: Option<bool>,
    // SOLID
    color: Option<Color>,
    // GRADIENT
    blend_mode: Option<String>,
    gradient_handle_positions: Option<Vec<Coord>>,
    gradient_stops: Option<Vec<ColorStop>>,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFile {
    document: Document,
    components: HashMap<String, ComponentMetadata>,
    styles: HashMap<String, StyleMetadata>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Style {
    style_type: String, // "FILL" | "TEXT" | "EFFECT" | "GRID"
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TypeStyle {
    font_family: String,
    font_post_script_name: String,
    paragraph_spacing: Option<f64>,
    paragraph_indent: Option<f64>,
    italic: bool,
    font_weight: u32,
    font_size: f64,
    text_case: Option<String>, // "ORIGINAL" | "UPPER" | "LOWER" | "TITLE" | "SMALL_CAPS" | "SMALL_CAPS_FORCED"
    text_decoration: Option<String>, // "NONE" | "STRIKETHROUGH" | "UNDERLINE"
    text_auto_resize: Option<String>, // "NONE" | "HEIGHT" | "WIDTH_AND_HEIGHT"
    text_align_horizontal: String, // "LEFT" | "RIGHT" | "CENTER" | "JUSTIFIED"
    text_align_vertical: String, // "TOP" | "CENTER" | "BUTTOM"
    letter_spacing: f64,
    fills: Vec<Paint>,
    // hyperlink: Hyperlink,
    line_height_px: f64,
    line_height_percent: Option<f64>,
    line_height_percent_font_size: Option<f64>,
    line_height_unit: String, // "PIXELS" | "FONT_SIZE_%" | "INTRINSIC_%"
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ComponentMetadata {
    key: String,
    name: String,
    description: String,
    documentation_links: Vec<String>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StyleMetadata {
    key: String,
    name: String,
    style_type: String, // "FILL" | "TEXT" | "EFFECT" | "GRID"
    description: String,
}

#[derive(Deserialize, Serialize)]
pub struct FigmaMapping {
    style: Option<String>, // either style or component is required
    component: Option<String>,
    token: String,
    r#type: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    token_id: String,
    r#type: String,
    value: String,
}

pub fn build_from_figma(figma_json: &String, mappings_json: &String) -> String {
    let mut updates: Vec<Update> = Vec::new();
    let mut figma_file: ProjectFile;
    match serde_json::from_str::<ProjectFile>(figma_json) {
        Ok(parsed) => {
            figma_file = parsed;
        }
        Err(msg) => {
            return serde_json::json!({ "result": [],"errors": [format!("{}", msg)] }).to_string();
        }
    }
    let mut mappings: Vec<FigmaMapping>;
    match serde_json::from_str::<Vec<FigmaMapping>>(mappings_json) {
        Ok(parsed) => {
            mappings = parsed;
        }
        Err(msg) => {
            return serde_json::json!({ "result": [], "errors": [format!("{}", msg)] }).to_string();
        }
    }
    let mut errors: Vec<String> = Vec::new();
    for map in mappings {
        if map.style.is_some() && map.component.is_some() {
            errors.push(format!("Cannot specify both style \"{}\" and component \"{}\", please use one or the other", map.style.unwrap(), map.component.unwrap()));
            break;
        }
        if map.style.is_none() && map.component.is_none() {
            errors.push("missing style and component".to_owned());
            break;
        }
        let mut node: Option<Node> = None;
        let is_style = map.style.is_some();
        let node_name = if is_style {
            map.style.unwrap()
        } else {
            map.component.unwrap()
        };
        if is_style {
            let node_match = figma_file
                .styles
                .iter()
                .find(|(id, node_meta)| node_meta.name == node_name);
            if node_match.is_some() {
                let (id, node_meta) = node_match.unwrap();
                let style = get_first_node(&"id".to_owned(), &id, &figma_file.document.children);
                if style.is_ok() {
                    node = Some(style.unwrap());
                }
            }
        } else {
            let node_match = figma_file
                .components
                .iter()
                .find(|(id, node_meta)| node_meta.name == node_name);
            if node_match.is_some() {
                let (id, node_meta) = node_match.unwrap();
                let component =
                    get_first_node(&"id".to_owned(), &id, &figma_file.document.children);
                if component.is_ok() {
                    node = Some(component.unwrap());
                }
            }
        }
        if node.is_none() {
            let label = if is_style { "style" } else { "component" };
            errors.push(format!("could not locate {} \"{}\"", label, node_name));
            break;
        }
        match map.r#type.as_ref() {
            "color" => match get_color(&node.unwrap()) {
                Ok(color) => {
                    let update = Update {
                        token_id: map.token,
                        r#type: "color".to_owned(),
                        value: color,
                    };
                    updates.push(update)
                }
                Err(msg) => errors.push(msg),
            },
            _ => {
                // TODO: other types
            }
        }
    }
    return serde_json::json!({ "result": updates, "errors": errors }).to_string();
}

fn get_node_id(node: &Node) -> String {
    return match node {
        Node::Canvas(c) => c.id.to_owned(),
        Node::Component(c) => c.id.to_owned(),
        Node::ComponentSet(c) => c.id.to_owned(),
        Node::Ellipse(c) => c.id.to_owned(),
        Node::Frame(c) => c.id.to_owned(),
        Node::Group(c) => c.id.to_owned(),
        Node::Instance(c) => c.id.to_owned(),
        Node::Line(c) => c.id.to_owned(),
        Node::Rectangle(c) => c.id.to_owned(),
        Node::RegularPolygon(c) => c.id.to_owned(),
        Node::Slice(c) => c.id.to_owned(),
        Node::Star(c) => c.id.to_owned(),
        Node::Text(c) => c.id.to_owned(),
        Node::Vector(c) => c.id.to_owned(),
    };
}

fn get_node_type(node: &Node) -> String {
    return match node {
        Node::Canvas(c) => c.r#type.to_owned(),
        Node::Component(c) => c.r#type.to_owned(),
        Node::ComponentSet(c) => c.r#type.to_owned(),
        Node::Ellipse(c) => c.r#type.to_owned(),
        Node::Frame(c) => c.r#type.to_owned(),
        Node::Group(c) => c.r#type.to_owned(),
        Node::Instance(c) => c.r#type.to_owned(),
        Node::Line(c) => c.r#type.to_owned(),
        Node::Rectangle(c) => c.r#type.to_owned(),
        Node::RegularPolygon(c) => c.r#type.to_owned(),
        Node::Slice(c) => c.r#type.to_owned(),
        Node::Star(c) => c.r#type.to_owned(),
        Node::Text(c) => c.r#type.to_owned(),
        Node::Vector(c) => c.r#type.to_owned(),
    };
}

fn get_node_name(node: &Node) -> String {
    return match node {
        Node::Canvas(c) => c.name.to_owned(),
        Node::Component(c) => c.name.to_owned(),
        Node::ComponentSet(c) => c.name.to_owned(),
        Node::Ellipse(c) => c.name.to_owned(),
        Node::Frame(c) => c.name.to_owned(),
        Node::Group(c) => c.name.to_owned(),
        Node::Instance(c) => c.name.to_owned(),
        Node::Line(c) => c.name.to_owned(),
        Node::Rectangle(c) => c.name.to_owned(),
        Node::RegularPolygon(c) => c.name.to_owned(),
        Node::Slice(c) => c.name.to_owned(),
        Node::Star(c) => c.name.to_owned(),
        Node::Text(c) => c.name.to_owned(),
        Node::Vector(c) => c.name.to_owned(),
    };
}

fn get_first_node(key: &String, value: &String, nodes: &Vec<Node>) -> Result<Node, String> {
    for n in nodes.iter() {
        let mut found_value: String = "".to_owned();
        match key.as_ref() {
            "type" => found_value = get_node_type(n),
            "id" => found_value = get_node_id(n),
            "name" => found_value = get_node_name(n),
            _ => return Err(format!("unsupported key: \"{}\"", key)),
        }
        if found_value == *value {
            return Ok(n);
        }
        match n {
            Node::Canvas(c) => return get_first_node(key, value, &c.children),
            Node::Component(c) => return get_first_node(key, value, &c.children),
            Node::ComponentSet(c) => return get_first_node(key, value, &c.children),
            Node::Ellipse(c) => return get_first_node(key, value, &c.children),
            Node::Frame(c) => return get_first_node(key, value, &c.children),
            Node::Group(c) => return get_first_node(key, value, &c.children),
            Node::Instance(c) => return get_first_node(key, value, &c.children),
            Node::Line(c) => return get_first_node(key, value, &c.children),
            Node::RegularPolygon(c) => return get_first_node(key, value, &c.children),
            Node::Slice(c) => return get_first_node(key, value, &c.children),
            Node::Star(c) => return get_first_node(key, value, &c.children),
            Node::Vector(c) => return get_first_node(key, value, &c.children),
            _ => {}
        };
    }
    return Err(format!("Could not locate {}: {}", key, value));
}

// note: currently limited to "fill"
fn get_color(node: &Node) -> Result<String, String> {
    match node {
        Node::Canvas(c) => return Ok(c.background_color.to_hex()),
        Node::Component(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::ComponentSet(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Ellipse(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Frame(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Group(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Instance(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Line(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Rectangle(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::RegularPolygon(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Slice(_) => return Err("Could not extract color from type: \"SLICE\"".to_owned()),
        Node::Star(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Text(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
        Node::Vector(c) => {
            for fill in c.fills.iter() {
                if fill.color.is_some() {
                    return Ok(fill.color.as_ref().unwrap().to_hex());
                }
            }
        }
    }

    let children: Vec<Node> = match node {
        Node::Canvas(c) => c.children,
        Node::Component(c) => c.children,
        Node::ComponentSet(c) => c.children,
        Node::Frame(c) => c.children,
        Node::Group(c) => c.children,
        _ => Vec::new(),
    };
    if children.len() > 0 {
        let color_node = children.iter().find(|n| get_node_type(n) != "SLICE");
        if color_node.is_some() {
            return get_color(&color_node.unwrap());
        }
    }
    return Err("Could not find extract color".to_owned());
}
