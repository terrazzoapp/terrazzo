mod figma;
mod parse;
mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn parse(code: String) -> String {
    utils::set_panic_hook();
    return parse::parse_and_validate(&code);
}

#[wasm_bindgen]
pub fn build_figma(figma_json: String, mappings_json: String) -> String {
    utils::set_panic_hook();
    return figma::build_from_figma(&figma_json, &mappings_json);
}
