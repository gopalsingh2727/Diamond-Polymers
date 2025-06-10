const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  
  setHasSubmitted(true);
  const formData = new FormData();

  
  const fields: (keyof AccountFormData)[] = [
    'companyName', 'firstName', 'lastName', 'email', 
    'phone1', 'phone2', 'whatsapp', 'telephone',
    'address1', 'address2', 'state', 'pinCode'
  ];

  fields.forEach(field => {
    const value = formValues[field] || '';
    formData.append(field, value.toString());
  });

  formData.append("branchId", localStorage.getItem("selectedBranch") || "");

  if (formValues.image) {
    formData.append("image", formValues.image);
  }

  dispatch(createAccount(formData) as any);
};

//image 

const handleSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("phone1", phone1);
  formData.append("address1", address1);
  formData.append("state", state);
  formData.append("pinCode", pinCode);

  if (imageFile) {
    formData.append("image", imageFile); // 👈 THIS IS ESSENTIAL
  }

  dispatch(createAccount(formData));
};

