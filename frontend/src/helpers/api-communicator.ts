import axios from "axios";

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post("/user/login", { email, password });

  if (res.status != 201) {
    throw new Error("Unable to login");
  }

  const data = await res.data;
  return data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await axios.post("/user/signup", { name, email, password });

  if (res.status != 201) {
    throw new Error("Unable to Signup");
  }

  const data = await res.data;
  return data;
};

export const checkAuthStatus = async () => {
  const res = await axios.get("/user/auth-status");

  if (res.status != 200) {
    throw new Error("Unable to authenticate");
  }

  const data = await res.data;
  return data;
};

export const checkJobStatus = async (jobId: string) => {
  const res = await axios.get(`/chat/jobstatus/${jobId}`);

  if (res.status != 200) {
    // Usually, a 200 status code is used for successful GET requests
    throw new Error("Unable to get job status");
  }

  const data = res.data;
  return data;
};

export const deleteJob = async (jobId: string) => {
  const res = await axios.delete(`/chat/deleteJob/${jobId}`);

  if (res.status != 200) {
    throw new Error("Unable to delete job.");
  }

  const data = res.data;
  return data;
};

export const sendChatRequest = async (
  message: string,
  className: string,
  pageName: string
) => {
  const res = await axios.post("/chat/new", { message, className, pageName });

  if (res.status != 200) {
    throw new Error("Unable to send chat");
  }

  const data = await res.data;
  return data;
};

export const getUserChats = async (className: string, pageName: string) => {
  const res = await axios.get(`/chat/${className}/${pageName}`);

  if (res.status != 200) {
    throw new Error("Unable to send chat");
  }

  const data = await res.data;
  return data;
};

export const getUserClasses = async () => {
  const res = await axios.get(`/chat/classes`);

  if (res.status != 200) {
    throw new Error("Unable to get classes");
  }

  const data = await res.data;
  return data;
};

export const createNewClass = async (
  name: string,
  model: { name: string; instructions: string; model: string }
) => {
  const res = await axios.post("/chat/createClass", { name, model });

  if (res.status != 201) {
    throw new Error("Unable to create new class");
  }

  const data = await res.data;
  return data;
};

export const editUserClass = async (
  oldClassName: string,
  newClassName: string,
  modelInstructions: string
) => {
  const res = await axios.patch("/chat/editClass", {
    oldClassName,
    newClassName,
    modelInstructions,
  });

  if (res.status !== 201) {
    throw new Error("Unable to edit class");
  }

  const data = await res.data;
  return data;
};

export const createNewPage = async (
  className: string,
  pageName: string,
  pageInstructions: string
) => {
  const res = await axios.post("/chat/createPage", {
    className,
    pageName,
    pageInstructions,
  });

  if (res.status != 201) {
    throw new Error("Unable to create new page");
  }

  const data = await res.data;
  return data;
};

export const deleteUserClass = async (className: string) => {
  const res = await axios.delete(`/chat/deleteClass/${className}`);

  if (res.status != 200) {
    throw new Error("Unable to delete class");
  }

  const data = await res.data;
  return data;
};

export const editUserPage = async (
  className: string,
  oldName: string,
  newName: string,
  pageInstructions: string
) => {
  const res = await axios.patch("/chat/editPage", {
    className,
    oldName,
    newName,
    pageInstructions,
  });

  if (res.status != 201) {
    throw new Error("Unable to edit page");
  }

  const data = await res.data;
  return data;
};

export const deleteUserChats = async (className: string, pageName: string) => {
  const res = await axios.delete(`/chat/delete/${className}/${pageName}`);

  if (res.status != 201) {
    throw new Error("Unable to delete chat");
  }

  const data = await res.data;
  return data;
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");

  if (res.status != 201) {
    throw new Error("Unable to send chat");
  }

  const data = await res.data;
  return data;
};

export const deleteClassPage = async (className: string, pageName: string) => {
  const res = await axios.delete(`/chat/deletePage/${className}/${pageName}`);

  if (res.status != 200) {
    throw new Error("Unable to delete page");
  }

  const data = await res.data;
  return data;
};
