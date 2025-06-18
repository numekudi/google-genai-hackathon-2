import { FaUser } from "react-icons/fa";
import { FaCheck, FaUserDoctor, FaX } from "react-icons/fa6";
import { Button } from "../../components/ui/button";
import type { HumanMessage } from "./types";

export default function Message({
  message,
  changeContent,
  isLastElement,
  isFirstElement,
  handleDelete,
  handleSubmit,
  disabled,
}: {
  message: HumanMessage;
  changeContent: (newContent: string) => void;
  isLastElement: boolean;
  isFirstElement: boolean;
  handleDelete: () => void;
  handleSubmit: () => void;
  disabled: boolean;
}) {
  const isDoctor = message.role === "doctor";
  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-2 p-2 ${
          isDoctor ? "justify-start" : "justify-end bg-indigo-50"
        } w-full`}
      >
        {isLastElement && !isFirstElement && (
          <Button
            onClick={handleDelete}
            className={`bg-red-50 dark:bg-red-900 p-2 rounded ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={disabled}
          >
            <FaX color="black" />
          </Button>
        )}
        <div className="flex items-center gap-2 flex-1">
          {isDoctor ? <FaUserDoctor /> : <FaUser />}
          <textarea
            className="border dark:border-gray-600 rounded p-2 min-w-[200px] w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={message.content}
            onChange={(e) => changeContent(e.target.value)}
            disabled={!isLastElement || disabled}
          />
        </div>
        {isLastElement && (
          <Button
            onClick={handleSubmit}
            className="bg-green-50 dark:bg-green-900 p-2 rounded"
            disabled={disabled}
          >
            <FaCheck color="black" />
          </Button>
        )}
      </div>
      {message.suggestions && message.suggestions.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 px-2 w-full">
          {message.suggestions.map((s, i) =>
            !isLastElement || disabled ? null : (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => changeContent(s)}
                className="w-full max-w-full break-all whitespace-pre-line text-left py-2 min-h-0 h-auto items-start"
              >
                {s}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
