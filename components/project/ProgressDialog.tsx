import { Button } from "@/components/ui/button";

export const ProgressDialog = ({
  progress,
  setProgress,
  onSave,
  onCancel,
}: {
  progress: number;
  setProgress: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-lg font-semibold">Update Project Progress</h3>
      <div className="flex flex-col space-y-4">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          step={10}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <p className="text-center font-medium">{progress}% Complete</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="bg-[#4CAF50] text-white" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  </div>
);
