// GENERATED, do not edit by hand.
// Source: reels-optimizer repo, branch feat/kallaway-method (857e618), prompts/kallaway/output-schema.json
// Used on the server to strip keys the schema does not declare.

import type { JsonSchema } from "./strip";
export const OUTPUT_SCHEMA: JsonSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "reels-optimizer/kallaway-1",
  "title": "Kallaway reel script analysis",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "input_ok",
    "goal",
    "verdict",
    "overall_score",
    "readiness",
    "core_idea",
    "assumptions",
    "topic_angle",
    "hook_gate",
    "criteria",
    "caps_applied",
    "hooks",
    "rewrite",
    "to_fix",
    "warnings"
  ],
  "definitions": {
    "source": {
      "description": "Kallaway link from the whitelist in system.md, or null for own extrapolation",
      "type": [
        "string",
        "null"
      ],
      "pattern": "^youtu\\.be/[A-Za-z0-9_-]{11}\\?t=[0-9]+$"
    },
    "hookFormat": {
      "type": "string",
      "enum": [
        "secret",
        "case",
        "comparison",
        "question",
        "teaching",
        "list",
        "contrarian",
        "personal",
        "problem"
      ]
    },
    "criterion": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "name",
        "score",
        "weight",
        "reasoning",
        "quote",
        "source",
        "source_type"
      ],
      "properties": {
        "id": {
          "type": "string",
          "enum": [
            "topic",
            "angle",
            "hook",
            "proof",
            "clarity",
            "retention",
            "cta"
          ]
        },
        "name": {
          "type": "string",
          "description": "Russian label for UI"
        },
        "score": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10
        },
        "weight": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100
        },
        "reasoning": {
          "type": "string"
        },
        "quote": {
          "type": [
            "string",
            "null"
          ],
          "description": "verbatim fragment of the student's script"
        },
        "source": {
          "$ref": "#/definitions/source"
        },
        "source_type": {
          "type": "string",
          "enum": [
            "kallaway",
            "extrapolation"
          ]
        }
      }
    }
  },
  "properties": {
    "schema_version": {
      "type": "string",
      "const": "kallaway-1"
    },
    "input_ok": {
      "type": "boolean",
      "description": "false = script empty/too short/not a reel script; UI shows verdict only"
    },
    "goal": {
      "type": "string",
      "enum": [
        "conversion",
        "virality"
      ]
    },
    "verdict": {
      "type": "string",
      "description": "1-2 sentences, main diagnosis"
    },
    "overall_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "readiness": {
      "type": "string",
      "enum": [
        "ready",
        "needs_work",
        "rewrite"
      ]
    },
    "core_idea": {
      "type": "string"
    },
    "assumptions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "topic_angle": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "topic",
        "angle",
        "audience_ring",
        "format_level",
        "shock_score",
        "verdict",
        "better_angle",
        "source"
      ],
      "properties": {
        "topic": {
          "type": "string"
        },
        "angle": {
          "type": "string"
        },
        "audience_ring": {
          "type": "integer",
          "minimum": 1,
          "maximum": 5,
          "description": "audience bullseye ring, 1 = exact buyer, 5 = anything near the topic"
        },
        "format_level": {
          "type": "string",
          "enum": [
            "facts",
            "explanation",
            "application",
            "story"
          ]
        },
        "shock_score": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100,
          "description": "how many of 100 target viewers have NOT heard this"
        },
        "verdict": {
          "type": "string"
        },
        "better_angle": {
          "type": [
            "string",
            "null"
          ]
        },
        "source": {
          "$ref": "#/definitions/source"
        }
      }
    },
    "hook_gate": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "first_sentence",
        "pass",
        "subject",
        "stakes",
        "clear",
        "fast",
        "hook_format",
        "reason",
        "source"
      ],
      "properties": {
        "first_sentence": {
          "type": "string"
        },
        "pass": {
          "type": "boolean"
        },
        "subject": {
          "type": "boolean"
        },
        "stakes": {
          "type": "boolean"
        },
        "clear": {
          "type": "boolean"
        },
        "fast": {
          "type": "boolean"
        },
        "hook_format": {
          "type": "string",
          "enum": [
            "secret",
            "case",
            "comparison",
            "question",
            "teaching",
            "list",
            "contrarian",
            "personal",
            "problem",
            "none"
          ]
        },
        "reason": {
          "type": "string"
        },
        "source": {
          "$ref": "#/definitions/source"
        }
      }
    },
    "criteria": {
      "type": "array",
      "minItems": 7,
      "maxItems": 7,
      "items": {
        "$ref": "#/definitions/criterion"
      }
    },
    "caps_applied": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "hooks": {
      "type": "array",
      "minItems": 3,
      "maxItems": 3,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "text",
          "on_screen_text",
          "format",
          "why",
          "source"
        ],
        "properties": {
          "text": {
            "type": "string"
          },
          "on_screen_text": {
            "type": "string"
          },
          "format": {
            "$ref": "#/definitions/hookFormat"
          },
          "why": {
            "type": "string"
          },
          "source": {
            "$ref": "#/definitions/source"
          }
        }
      }
    },
    "rewrite": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "script",
        "placeholders",
        "changes"
      ],
      "properties": {
        "script": {
          "type": "string",
          "description": "lines separated by \\n; [bracketed] placeholders where proof/facts are missing"
        },
        "placeholders": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "changes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "to_fix": {
      "type": "array",
      "maxItems": 6,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "priority",
          "kind",
          "text",
          "source"
        ],
        "properties": {
          "priority": {
            "type": "integer",
            "minimum": 1
          },
          "kind": {
            "type": "string",
            "enum": [
              "fix",
              "bring"
            ],
            "description": "fix = change the script, bring = student must supply proof/material"
          },
          "text": {
            "type": "string"
          },
          "source": {
            "$ref": "#/definitions/source"
          }
        }
      }
    },
    "warnings": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
};
