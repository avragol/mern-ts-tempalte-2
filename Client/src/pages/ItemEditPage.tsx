import { useParams } from "react-router-dom";
import ItemFormPage from "./ItemFormPage";

export default function ItemEditPage() {
  const { id } = useParams<{ id: string }>();
  return <ItemFormPage editId={id} />;
}
