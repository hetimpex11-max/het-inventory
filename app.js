let inventory = JSON.parse(localStorage.getItem("inventory")) || {};

function saveInventory() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
  renderInventory();
}

function makeSKU(design, style, color, size) {
  return `${design}-${style}-${color}-${size}`.toUpperCase();
}

function addInventory() {
  const design = document.getElementById("designNumber").value.trim();
  const style = document.getElementById("style").value.trim();
  const color = document.getElementById("color").value.trim();
  const size = document.getElementById("size").value.trim();
  const pieces = parseInt(document.getElementById("pieces").value);

  if (!design || !style || !color || !size || isNaN(pieces)) {
    return alert("Please enter valid product details");
  }

  const sku = makeSKU(design, style, color, size);
  inventory[sku] = (inventory[sku] || 0) + pieces;
  saveInventory();

// Generate QR + Barcode + Download Option
const codesDiv = document.getElementById("codes");
codesDiv.innerHTML = "";

QRCode.toCanvas(document.createElement("canvas"), sku, (err, canvas) => {
  if (!err) {
    // Create new canvas to add text below QR
    const finalCanvas = document.createElement("canvas");
    const ctx = finalCanvas.getContext("2d");

    // Set new height for QR + text
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height + 30;

    // Draw QR on top
    ctx.drawImage(canvas, 0, 0);

    // Add Design Number text
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(sku, finalCanvas.width / 2, canvas.height + 20);

    finalCanvas.id = "qrCanvas";
    codesDiv.appendChild(finalCanvas);

    // Download button
    const dlBtn = document.createElement("button");
    dlBtn.textContent = "Download QR";
    dlBtn.onclick = () => {
      const link = document.createElement("a");
      link.download = `${sku}-QR.png`;
      link.href = finalCanvas.toDataURL("image/png");
      link.click();
    };
    codesDiv.appendChild(dlBtn);
  }
});


  const svg = document.createElement("svg");
  JsBarcode(svg, sku, { format: "CODE128", displayValue: true });
  codesDiv.appendChild(svg);
}

function toggleManualForm() {
  const form = document.getElementById("manualForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function manualAdjust() {
  const design = document.getElementById("manualDesign").value.trim();
  const style = document.getElementById("manualStyle").value.trim();
  const color = document.getElementById("manualColor").value.trim();
  const size = document.getElementById("manualSize").value.trim();
  const stock = parseInt(document.getElementById("manualStock").value);

  if (!design || !style || !color || !size || isNaN(stock)) {
    return alert("Enter valid details");
  }

  const sku = makeSKU(design, style, color, size);
  inventory[sku] = stock;
  saveInventory();
}

function renderInventory() {
  const list = document.getElementById("inventoryList");
  list.innerHTML = "";

  // Create a table
  let table = document.createElement("table");
  table.className = "inventory-table";

  // Header row
  table.innerHTML = `
    <tr>
      <th>Design #</th>
      <th>Style</th>
      <th>Color</th>
      <th>Size</th>
      <th>Stock</th>
    </tr>
  `;

  let totalPieces = 0;

  for (let sku in inventory) {
    const [style, color, size, design] = sku.split("-");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${design || "-"}</td>
      <td>${style}</td>
      <td>${color}</td>
      <td>${size}</td>
      <td>${inventory[sku]}</td>
    `;
    table.appendChild(tr);

    totalPieces += inventory[sku];
  }

  list.appendChild(table);

  // Total row
  const totalDiv = document.createElement("div");
  totalDiv.className = "total-pieces";
  totalDiv.textContent = `Total Pieces in Stock: ${totalPieces}`;
  list.appendChild(totalDiv);
}

function startScanner() {
  const reader = new Html5Qrcode("reader");
  reader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      if (inventory[decodedText] > 0) {
        inventory[decodedText] -= 1;
        saveInventory();
        alert(`✅ 1 piece deducted from ${decodedText}`);
      } else {
        alert(`❌ No stock for ${decodedText}`);
      }
    },
    (err) => {}
  );
}

renderInventory();
window.onload = startScanner;
