import React from "react";

export default function FlatList({ data, renderItem, keyExtractor, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </React.Fragment>
      ))}
    </div>
  );
}
