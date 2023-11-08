import { useEditor } from "@tldraw/tldraw";
import { useState } from "react";
import { getSvgAsImage } from "./lib/getSvgAsImage";
import { blobToBase64 } from "./lib/blobToBase64";
import { sendMessage } from "./lib/messageBus";

export const ExportButton = () => {
  const editor = useEditor();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async (e) => {
        setLoading(true);
        try {
          e.preventDefault();

          const svg = await editor.getSvg(
            Array.from(editor.currentPageShapeIds)
          );

          if (!svg) {
            console.error("Failed to grab svg");
            return;
          }

          console.debug("UI-Sketcher: grabbed svg");

          const png = await getSvgAsImage(svg, {
            type: "png",
            quality: 1,
            scale: 1,
          });

          console.debug("UI-Sketcher: created png");

          const dataUrl = (await blobToBase64(png!)) as string;

          console.debug("UI-Sketcher: computed base64");

          sendMessage({
            command: "tldraw:export",
            payload: { base64: dataUrl },
          });

          console.debug("UI-Sketcher: sent message");
        } finally {
          setLoading(false);
        }
      }}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      style={{ zIndex: 1000 }}
    >
      {loading ? (
        <div className="flex justify-center items-center ">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      ) : (
        "Make Real"
      )}
    </button>
  );
};
