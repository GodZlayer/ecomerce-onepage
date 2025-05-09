import React from "react";
import { OutputData } from '@editorjs/editorjs';

interface AboutProps {
  title: string;
  content: OutputData;
}

const About: React.FC<AboutProps> = ({ title, content }) => {
  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">{title}</h1>
        <div className="bg-white p-8 rounded-lg shadow-md editorjs-render prose max-w-none">
          {content && content.blocks && Array.isArray(content.blocks) && content.blocks.map((block, index) => {
            switch (block.type) {
              case 'header':
                const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
                return <HeaderTag key={index} className={`text-${6 - block.data.level}xl font-bold mb-2`}>{block.data.text}</HeaderTag>;
              case 'paragraph':
                return <p key={index} className="text-gray-700 mb-4">{block.data.text}</p>;
              case 'list':
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                  <ListTag key={index} className={`list-${block.data.style === 'ordered' ? 'decimal' : 'disc'} pl-5 mb-4`}>
                    {block.data.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ListTag>
                );
              case 'image':
                return (
                  <div key={index} className="my-4">
                    <img src={block.data.file.url} alt={block.data.caption} className="max-w-full h-auto mx-auto" />
                    {block.data.caption && <p className="text-center text-sm text-gray-500 mt-1">{block.data.caption}</p>}
                  </div>
                );
              case 'embed':
                return (
                  <div key={index} className="my-4">
                    <iframe
                      src={block.data.embed}
                      width={block.data.width}
                      height={block.data.height}
                      allowFullScreen
                      className="mx-auto"
                    ></iframe>
                    {block.data.caption && <p className="text-center text-sm text-gray-500 mt-1">{block.data.caption}</p>}
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default About;
