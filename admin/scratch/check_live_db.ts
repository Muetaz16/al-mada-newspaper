async function run() {
  const adminUrl = "https://al-mada-newspaper-production.up.railway.app";
  const token = "7f1a8e9b6c0d4e3f2a1b9c8d7e6f5a4b";

  console.log("Deleting bad video entry...");
  const res = await fetch(`${adminUrl}/api/db`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": token
    },
    body: JSON.stringify({
      table: "videos",
      action: "delete",
      filters: { id: "78777c6a-7c5f-4e0e-85f0-959fabec84a0" }
    })
  });

  const data = await res.json();
  console.log("Delete result:", data);
}

run().catch(console.error);
