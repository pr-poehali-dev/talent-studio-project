import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const CLIENTS_URL = func2url["clients"];

interface Client {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export default function AdminClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deduping, setDeduping] = useState(false);
  const [dedupResult, setDedupResult] = useState<string>("");

  const load = () => {
    setLoading(true);
    fetch(CLIENTS_URL)
      .then((r) => r.json())
      .then((data) => setClients(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    setError("");
    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    setAdding(true);
    const res = await fetch(CLIENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", email: email.trim(), name: name.trim() }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok) {
      setEmail("");
      setName("");
      load();
    } else {
      setError(data.error || "Ошибка");
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(CLIENTS_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const handleDedup = async () => {
    setDeduping(true);
    setDedupResult("");
    const res = await fetch(CLIENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dedup" }),
    });
    const data = await res.json();
    setDeduping(false);
    setDedupResult(`Удалено дублей: ${data.deleted}`);
    load();
  };

  const filtered = clients.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Клиенты</h2>
        <span className="text-muted-foreground text-sm">{clients.length} записей</span>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 mb-6 border">
        <h3 className="font-semibold mb-3">Добавить клиента</h3>
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[200px]"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Input
            placeholder="Имя (необязательно)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[160px]"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={adding}>
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex gap-3 mb-4 items-center">
        <Input
          placeholder="Поиск по email или имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={handleDedup} disabled={deduping}>
          <Icon name="ScanSearch" className="mr-2" size={16} />
          {deduping ? "Проверяю..." : "Удалить дубли"}
        </Button>
      </div>
      {dedupResult && (
        <p className="text-sm text-green-600 mb-3">{dedupResult}</p>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">Нет клиентов</div>
      ) : (
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Имя</th>
                <th className="text-left px-4 py-3 font-semibold">Добавлен</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-mono">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Icon name="Trash2" size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
