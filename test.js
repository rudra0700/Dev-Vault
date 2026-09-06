const url = "https://jsonplaceholder.typicode.com/users";
try {
  const response = await fetch(url);
  console.log(response);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }


  const data = await response.json();
  console.log(data.map((user) => user.name));
} catch (error) {
    console.log(error);
    
  console.error("Error fetching data:", error.message, error.status);
}
