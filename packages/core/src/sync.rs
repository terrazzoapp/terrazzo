use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE", tag = "type")]
pub enum Node {
    #[serde(rename_all = "camelCase")]
    Canvas {
        children: Vec<Node>,
    },
    Component(Component),
    #[serde(rename_all = "camelCase")]
    ComponentSet {
        absolute_bounding_box: BoundingBox,
        corner_radius: f64,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: f64,
        rectangle_corner_radii: [f64; 4],
        strokes: Vec<Paint>,
        stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    Ellipse {
        absolute_bounding_box: BoundingBox,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: Option<f64>,
        strokes: Vec<Paint>,
        stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
        stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    Frame {
        absolute_bounding_box: BoundingBox,
        corner_radius: f64,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: f64,
        rectangle_corner_radii: [f64; 4],
        strokes: Vec<Paint>,
        stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    Group {
        children: Vec<Node>,
    },
    #[serde(rename_all = "camelCase")]
    Instance {
        absolute_bounding_box: BoundingBox,
        corner_radius: f64,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: f64,
        rectangle_corner_radii: [f64; 4],
        strokes: Vec<Paint>,
        stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    Line {
        absolute_bounding_box: BoundingBox,
        corner_radius: f64,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: f64,
        rectangle_corner_radii: [f64; 4],
        strokes: Vec<Paint>,
        stroke_align: String, // "MITER" | "BEVEL" | "ROUND"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    Rectangle {
        corner_radius: f64,
        rectangle_corner_radii: [f64; 4],
        fills: Vec<Paint>,
        opacity: Option<f64>,
        strokes: Vec<Paint>,
        stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
        stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    RegularPolygon {
        children: Vec<Node>,
    },
    #[serde(rename_all = "camelCase")]
    Slice {
        absolute_bounding_box: BoundingBox,
        children: Vec<Node>,
    },
    #[serde(rename_all = "camelCase")]
    Star {
        absolute_bounding_box: BoundingBox,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: Option<f64>,
        strokes: Vec<Paint>,
        stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
        stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
        stroke_weight: f64,
    },
    #[serde(rename_all = "camelCase")]
    Text {
        style: TypeStyle,
    },
    #[serde(rename_all = "camelCase")]
    Vector {
        absolute_bounding_box: BoundingBox,
        children: Vec<Node>,
        fills: Vec<Paint>,
        opacity: Option<f64>,
        strokes: Vec<Paint>,
        stroke_align: String,            // "MITER" | "BEVEL" | "ROUND"
        stroke_geometry: Option<String>, // "INSIDE" | "OUTSIDE" | "CENTER"
        stroke_weight: f64,
    },
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
    r: u8,
    g: u8,
    b: u8,
    a: f32,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Component {
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
    components: HashMap<String, Component>,
    styles: HashMap<String, Style>,
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

pub fn sync_from_figma(figma_doc: &String, mappings_json: &String) -> String {
    let mut doc: Document;
    match serde_json::from_str::<ProjectFile>(figma_doc) {
        Ok(parsed) => {
            doc = parsed.document;
        }
        Err(msg) => {
            return serde_json::json!({
                "result": {},
                "errors": [format!("{}", msg)],
            })
            .to_string();
        }
    }

    return serde_json::json!({
        "result": {},
        "errors": [],
    })
    .to_string();
}
