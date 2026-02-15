import Input from "./Input.jsx";

export default function SearchInput(props) {
  return <Input type="search" icon={<span className="text-slate-400">🔍</span>} placeholder="Search" {...props} />;
}
