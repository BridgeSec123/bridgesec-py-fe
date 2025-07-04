import React from "react";
import { Differ, Viewer } from "json-diff-kit";
import "json-diff-kit/dist/viewer.css";

const JsonDiff = ({sourceLeft, sourceRight}) => {

  const differ = new Differ({
    detectCircular: true, // default `true`
    maxDepth: Infinity, // default `Infinity`
    showModifications: true,
    preserveKeyOrder:true, // default `true`
    arrayDiffMethod: "normal" // default `"normal"`, but `"lcs"` may be more useful
  });

  const diff = differ.diff(sourceLeft, sourceRight);

  return (
    <div className="json-diff">
      <Viewer
        diff={diff}
        indent={4}
        lineNumbers={true} // default `false`
        highlightInlineDiff={true} // default `false`
        inlineDiffOptions={{
          mode: "word",
          wordSeparator: " " // default `""`, but `" "` is more useful for sentences
        }}
        style={{
          fontFamily: "Consolas, monospace",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          padding: "0.7rem",
          boxShadow: "unset"
        }}
      />
    </div>
  );
}

export default JsonDiff;
