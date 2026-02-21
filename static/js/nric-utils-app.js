const WEIGHTS = [2, 7, 6, 5, 4, 3, 2];
const ST_CHECKSUM = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
const FG_CHECKSUM = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];

function calculateChecksum(prefix, digits) {
  let total = 0;
  for (let i = 0; i < WEIGHTS.length; i += 1) {
    total += Number(digits[i]) * WEIGHTS[i];
  }

  if (prefix === "T" || prefix === "G") {
    total += 4;
  }

  const remainder = total % 11;
  if (prefix === "S" || prefix === "T") {
    return ST_CHECKSUM[remainder];
  }
  return FG_CHECKSUM[remainder];
}

function nricIsValid(nric) {
  const normalized = String(nric).trim().toUpperCase();
  if (!/^[STFG]\d{7}[A-Z]$/.test(normalized)) {
    return false;
  }

  const prefix = normalized[0];
  const digits = normalized.slice(1, 8);
  const checksum = normalized.slice(-1);
  return checksum === calculateChecksum(prefix, digits);
}

function randomChoice(values) {
  const index = Math.floor(Math.random() * values.length);
  return values[index];
}

function randomDigits(length) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += String(Math.floor(Math.random() * 10));
  }
  return result;
}

function generateNric(valid = true) {
  const prefix = randomChoice(["S", "T", "F", "G"]);
  const digits = randomDigits(7);
  const checksum = calculateChecksum(prefix, digits);

  if (valid) {
    return `${prefix}${digits}${checksum}`;
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    .split("")
    .filter((letter) => letter !== checksum);
  return `${prefix}${digits}${randomChoice(letters)}`;
}

function setResult(element, message, type = "success") {
  element.textContent = message;
  element.classList.remove("success", "error");
  element.classList.add(type);
}

function rowsToCsv(rows) {
  return Papa.unparse(rows, { delimiter: "," });
}

function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeObjectRecord(record) {
  const normalized = {};
  Object.keys(record).forEach((key) => {
    const trimmed = String(key).trim();
    if (trimmed !== "") {
      normalized[trimmed] = record[key];
    }
  });
  return normalized;
}

function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          reject(new Error(results.errors[0].message || "Failed to parse CSV file."));
          return;
        }
        resolve(results.data.map(normalizeObjectRecord));
      },
      error: () => reject(new Error("Failed to parse CSV file."))
    });
  });
}

async function parseXlsxFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return jsonRows.map(normalizeObjectRecord);
}

async function parseTabularFile(file) {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) {
    return parseCsvFile(file);
  }
  if (fileName.endsWith(".xlsx")) {
    return parseXlsxFile(file);
  }
  throw new Error("Unsupported file type. Please upload a CSV or XLSX file.");
}

function initializeValidateOne() {
  const form = document.getElementById("validate-form");
  const input = document.getElementById("validate-nric");
  const result = document.getElementById("validate-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    const valid = nricIsValid(value);
    setResult(result, valid ? "Valid NRIC" : "Invalid NRIC", valid ? "success" : "error");
  });
}

function initializeValidateFile() {
  const form = document.getElementById("validate-file-form");
  const fileInput = document.getElementById("validate-file-input");
  const columnInput = document.getElementById("validate-file-column");
  const result = document.getElementById("validate-file-result");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = fileInput.files && fileInput.files[0];
    const column = columnInput.value.trim();

    if (!file || !column) {
      setResult(result, "Please select a file and provide the column name.", "error");
      return;
    }

    try {
      const rows = await parseTabularFile(file);
      if (rows.length === 0) {
        setResult(result, "The uploaded file has no data rows.", "error");
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(rows[0], column)) {
        setResult(result, `Column \"${column}\" was not found in the file.`, "error");
        return;
      }

      const validatedRows = rows.map((row) => {
        const copy = { ...row };
        copy.valid = nricIsValid(String(row[column]));
        return copy;
      });

      const csv = rowsToCsv(validatedRows);
      downloadCsv("validated.csv", csv);
      setResult(result, `Validated ${validatedRows.length} row(s). Download started.`, "success");
    } catch (error) {
      setResult(result, error.message || "Failed to validate file.", "error");
    }
  });
}

function initializeGenerateOne() {
  const form = document.getElementById("generate-form");
  const validitySelect = document.getElementById("generate-validity");
  const result = document.getElementById("generate-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = validitySelect.value === "true";
    const nric = generateNric(valid);
    setResult(result, nric, "success");
  });
}

function initializeGenerateList() {
  const form = document.getElementById("generate-list-form");
  const countInput = document.getElementById("generate-list-count");
  const validitySelect = document.getElementById("generate-list-validity");
  const result = document.getElementById("generate-list-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const count = Number.parseInt(countInput.value, 10);
    if (Number.isNaN(count) || count < 1 || count > 1000) {
      setResult(result, "Count must be between 1 and 1000.", "error");
      return;
    }

    const valid = validitySelect.value === "true";
    const nrics = [];
    for (let i = 0; i < count; i += 1) {
      const nricValue = generateNric(valid);
      nrics.push({ "#": i + 1, nric: nricValue, valid: valid });
    }

    const csv = rowsToCsv(nrics);
    downloadCsv("nric_list.csv", csv);
    setResult(result, `Generated ${count} NRIC value(s). Download started.`, "success");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeValidateOne();
  initializeValidateFile();
  initializeGenerateOne();
  initializeGenerateList();
});
