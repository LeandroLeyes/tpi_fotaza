export default function blobABase64(blob) {
  if (!blob) return null;
  return `data:image/jpeg;base64,${Buffer.from(blob).toString("base64")}`;
}
