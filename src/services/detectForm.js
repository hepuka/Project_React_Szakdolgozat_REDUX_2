const detectForm = (id, f1, f2) => {
  if (id === "ADD") {
    return f1;
  } else {
    return f2;
  }
};

export default detectForm;
