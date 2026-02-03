import { EVZONE } from "./constants";
import { Risk } from "./types";

// Get the color tone for a risk level
export function riskTone(r: Risk): string {
    if (r === "High") return "#B42318";
    if (r === "Medium") return EVZONE.orange;
    return EVZONE.green;
}
