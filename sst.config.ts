import { SSTConfig } from "sst";
import { AWStack } from "./stacks/AWStack";

export default {
  config(_input) {
    return {
      name: "ai-aws-feed",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(AWStack);
  }
} satisfies SSTConfig;
