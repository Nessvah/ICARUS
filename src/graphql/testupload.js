const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3001/graphql', {
      method: 'POST',
      body: formData,
      // Headers will automatically be set to multipart/form-data
    });

    const data = await response.json();
    console.log('Upload response:', data);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
});
