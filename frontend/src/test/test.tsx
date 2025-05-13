import { createTacoBI, TacoBIProvider } from "@/tacobi/context";
import { DataSchema, Schema } from "@/tacobi/schema";

// --------------------------------------------------------------
// Testing
// --------------------------------------------------------------

const TEST_MODEL = {
  properties: {
    name: { title: "Name", type: "string" },
    age: { title: "Age", type: "number" },
  },
  required: ["name", "age"],
  type: "array",
} as const satisfies DataSchema;

const TEST_SCHEMA = {
  views: [
    {
      route: "/test_normal_view",
      data_schema: TEST_MODEL,
      input_schema: {
        name: "string",
        age: "number",
      },
    },
    {
      route: "/test_normal_view_2",
      data_schema: TEST_MODEL,
      input_schema: undefined,
    },
  ],
} as const satisfies Schema;

const { state, useTacoBI } = createTacoBI({
  schema: TEST_SCHEMA,
  url: "http://localhost:3000",
});

const Test = () => {
  const { useView } = useTacoBI();
  const view = useView("/test_normal_view", { name: "string", age: "number" });

  if (view.state === "pending") {
    return <div>Loading...</div>;
  }

  if (view.state === "error") {
    return <div>Error: {view.error.message}</div>;
  }

  return (
    <ul>
      {view.data.map((row) => (
        <li key={row.name}>
          <div>{row.name}</div>
          <div>{row.age}</div>
        </li>
      ))}
    </ul>
  );
};

const App = () => {
  return (
    <TacoBIProvider state={state}>
      <Test />
    </TacoBIProvider>
  );
};

export default App;
