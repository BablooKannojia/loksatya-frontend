"use client";

import { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useRouter } from "next/navigation";

const NewSearchModel = ({ closeModel, autoList = [] }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredOptions =
    search.trim() === ""
      ? []
      : autoList.filter((item) =>
          item.value.toLowerCase().includes(search.toLowerCase())
        );

  const handleSearch = (value) => {
    if (!value.trim()) return;

    router.push(`/itempage?item=${encodeURIComponent(value)}`);
    closeModel();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/30">
      <div className="mt-24 flex justify-center px-4">
        <div className="flex w-full max-w-2xl items-start gap-3">
          <div className="relative flex-1">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(search);
                }
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
            />

            {filteredOptions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                {filteredOptions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearch(item.value)}
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-100"
                  >
                    {item.value}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={closeModel}
            className="text-white transition hover:scale-110"
          >
            <IoIosCloseCircle size={44} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSearchModel;