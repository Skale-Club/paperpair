import { NextResponse } from "next/server";

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "PaperPair API",
    description: "API for marriage-based immigration case management",
    version: "1.0.0"
  },
  servers: [
    {
      url: "https://paperpair.com",
      description: "Production server"
    },
    {
      url: "http://localhost:3000",
      description: "Local development server"
    }
  ],
  paths: {
    "/api/chat": {
      post: {
        summary: "Chat with AI assistant",
        description: "Send messages to the AI assistant for case intake",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  messages: {
                    type: "array",
                    items: { type: "object" }
                  },
                  selectedTemplateKeys: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reply: { type: "string" },
                    extractedData: { type: "object" },
                    generatedFiles: { type: "array" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/dashboard/steps": {
      get: {
        summary: "Get case steps",
        description: "Retrieve all case steps for the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      stepSlug: { type: "string" },
                      stepOrder: { type: "integer" },
                      status: { type: "string" },
                      data: { type: "object" },
                      completedAt: { type: "string", format: "date-time" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Update case step",
        description: "Update a specific case step",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  stepSlug: { type: "string" },
                  status: { type: "string" },
                  data: { type: "object" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Successful update"
          }
        }
      }
    },
    "/api/profile": {
      get: {
        summary: "Get user profile",
        description: "Retrieve the authenticated user's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Successful response"
          }
        }
      },
      patch: {
        summary: "Update user profile",
        description: "Update user profile settings",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  googleApiKey: { type: "string" },
                  requireBiometricsForSensitiveDocs: { type: "boolean" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Successful update"
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
