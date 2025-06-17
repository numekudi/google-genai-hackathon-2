import { useState } from "react";
import Message from "./Message";
import type { HumanMessage } from "./types";

export default function Simulation() {
  const [messages, setMessages] = useState<HumanMessage[]>([
    {
      role: "doctor",
      content: "体調はどうですか？",
      suggestions: [
        "体調はどうですか？",
        "食事はどうですか？",
        "睡眠はどうですか？",
        "最近の悩みは何ですか？",
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditMessage = (index: number, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, content: newContent } : msg
      )
    );
  };

  const handleAddMessage = async () => {
    if (messages[messages.length - 1].content.trim() === "") return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        body: JSON.stringify(messages),
      });
      const body = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: prev[prev.length - 1].role === "doctor" ? "user" : "doctor",
          content: "",
          suggestions: body.suggestions,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (index: number) => {
    setMessages((prev) => prev.slice(0, index));
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto py-8">
      {messages.map((msg, i) => (
        <Message
          key={i}
          message={msg}
          changeContent={(c) => handleEditMessage(i, c)}
          isLastElement={i === messages.length - 1}
          isFirstElement={i === 0}
          handleDelete={() => handleDelete(i)}
          handleSubmit={handleAddMessage}
          disabled={isLoading}
        />
      ))}
    </div>
  );
}
