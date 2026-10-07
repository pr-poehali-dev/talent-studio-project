import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export interface JuryEditValues {
  full_name: string;
  position: string;
  institution: string;
  email: string;
  contest_name: string;
  participation_date: string;
}

interface Props {
  initial: JuryEditValues;
  onSave: (values: JuryEditValues) => Promise<boolean>;
  onCancel: () => void;
}

const FIELDS: { key: keyof JuryEditValues; label: string; type?: string }[] = [
  { key: "full_name", label: "ФИО" },
  { key: "position", label: "Должность" },
  { key: "institution", label: "Учреждение, страна, населённый пункт" },
  { key: "email", label: "Email", type: "email" },
  { key: "contest_name", label: "Конкурс" },
  { key: "participation_date", label: "Дата участия в жюри", type: "date" },
];

export default function JuryEditForm({ initial, onSave, onCancel }: Props) {
  const [values, setValues] = useState<JuryEditValues>(initial);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const ok = await onSave(values);
    setSaving(false);
    if (ok) onCancel();
  };

  return (
    <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-semibold block mb-1">{f.label}</label>
            <Input
              type={f.type || "text"}
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={submit} disabled={saving || !values.full_name.trim()}>
          <Icon name="Save" size={14} className="mr-1" />
          Сохранить
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
