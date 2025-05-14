function add<T extends number | string>(a: T, b: T): T {
  if (typeof a === "number" && typeof b === "number") {
    return (a + b) as T;
  }

  if (typeof a === "string" && typeof b === "string") {
    return (a + b) as T;
  }

  throw new Error("Invalid arguments");
}

const one: number = 1;
const two: string = "2";

add(one, one);
add(two, two);
