function generateCode() {
    const imageInput = document.getElementById('imageInput');
    const textInput = document.getElementById('textInput');

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('text', textInput.value);

    fetch('/generate', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('outputCode').innerText = data;
        document.getElementById('outputContainer').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
}
