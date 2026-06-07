async function run() {
  const adminUrl = "https://al-mada-newspaper-production.up.railway.app";
  const token = "7f1a8e9b6c0d4e3f2a1b9c8d7e6f5a4b";

  console.log("Fetching pulse_of_life from live DB...");
  const res = await fetch(`${adminUrl}/api/db`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": token
    },
    body: JSON.stringify({
      table: "pulse_of_life",
      action: "select",
      filters: {}
    })
  });

  const data = await res.json();
  console.log("Pulse of Life count:", data.data ? data.data.length : 0);
  console.log("Pulse of Life items:", JSON.stringify(data.data, null, 2));

  console.log("\nFetching reels from live DB...");
  const resReels = await fetch(`${adminUrl}/api/db`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": token
    },
    body: JSON.stringify({
      table: "reels",
      action: "select",
      filters: {}
    })
  });

  const dataReels = await resReels.json();
  console.log("Reels count:", dataReels.data ? dataReels.data.length : 0);
  console.log("Reels items:", JSON.stringify(dataReels.data, null, 2));
}

run().catch(console.error);
