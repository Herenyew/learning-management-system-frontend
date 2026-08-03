import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id: string) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (
            normalizedId.includes("/src/app/screens/configurationCenter/Certification") ||
            normalizedId.includes("/src/app/screens/configurationCenter/certificateDesigner")
          ) {
            return "screens-config-certificates";
          }
          if (normalizedId.includes("/src/app/pages/CatalogConfiguration/")) {
            return "screens-catalog-config";
          }
          if (normalizedId.includes("/src/app/screens/configurationCenter/MyCourses")) {
            return "screens-config-creator-courses";
          }
          if (normalizedId.includes("/src/app/screens/configurationCenter/")) {
            return "screens-configuration";
          }
          if (normalizedId.includes("/src/app/screens/extended/")) return "screens-hr";
          if (normalizedId.includes("/src/app/pages/Learner/")) return "screens-learner";
          if (normalizedId.includes("/src/app/screens/training/")) return "screens-training";
          if (normalizedId.includes("/src/app/screens/analyticsCenter/")) {
            return "screens-analytics";
          }
          if (!normalizedId.includes("node_modules")) return;
          if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("lucide-react")) return "vendor-icons";
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
