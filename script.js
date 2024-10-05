const urlBase = 'https://jsonplaceholder.typicode.com/posts';
let posts = [];

// Obtener datos iniciales de la API y almacenarlos localmente
function getData() {
    fetch(urlBase)
        .then(res => res.json())
        .then(data => {
            posts = data;
            renderPostList();
        })
        .catch(error => console.error('Error al llamar a la API: ', error));
}

getData();

// Renderizar la lista de posts en la UI
function renderPostList() {
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    posts.forEach(post => {
        const listItem = document.createElement('li');
        listItem.classList.add('postItem');
        listItem.innerHTML = `
            <strong>${post.title}</strong>
            <p>${post.body}</p>
            <button onclick="editPost(${post.id})">Editar</button>
            <button onclick="deletePost(${post.id})">Borrar</button>

            <div id="editForm-${post.id}" class="editForm" style="display:none">
                <label for="editTitle">Título: </label>
                <input type="text" id="editTitle-${post.id}" value="${post.title}" required>
                <label for="editBody"> Comentario: </label>
                <textarea id="editBody-${post.id}" required>${post.body}</textarea>
                <button onclick="updatePost(${post.id})"> Actualizar </button>
            </div>
        `;
        postList.appendChild(listItem);
    });
}

// Crear un nuevo post (almacenado localmente y simulado en la API)
function postData() {
    const postTitleInput = document.getElementById('postTitle');
    const postBodyInput = document.getElementById('postBody');
    const postTitle = postTitleInput.value;
    const postBody = postBodyInput.value;

    if (postTitle.trim() === '' || postBody.trim() === '') {
        alert('Los campos son obligatorios');
        return;
    }

    fetch(urlBase, {
        method: 'POST',
        body: JSON.stringify({
            title: postTitle,
            body: postBody,
            userId: 1,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
        .then(res => res.json())
        .then(data => {
            posts.unshift(data); // Agrega el post al principio del arreglo local
            renderPostList();
            postTitleInput.value = '';
            postBodyInput.value = '';
        })
        .catch(error => console.error('Error al querer crear posteo: ', error));
}

// Mostrar el formulario de edición
function editPost(id) {
    const editForm = document.getElementById(`editForm-${id}`);
    editForm.style.display = (editForm.style.display === 'none') ? 'block' : 'none';
}

// Actualizar un post localmente o en la API
function updatePost(id) {
    const editTitle = document.getElementById(`editTitle-${id}`).value;
    const editBody = document.getElementById(`editBody-${id}`).value;

    const index = posts.findIndex(post => post.id === id);

    if (index !== -1) {
        // Actualizar el post localmente
        posts[index].title = editTitle;
        posts[index].body = editBody;

        // Si el post tiene un ID mayor a 100, no hacer el PUT en la API
        if (id > 100) {
            // Actualización solo local
            renderPostList();
            alert('Post actualizado localmente.');
        } else {
            // Actualización a través de la API para IDs menores o iguales a 100
            fetch(`${urlBase}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    id: id,
                    title: editTitle,
                    body: editBody,
                    userId: 1,
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Error en la solicitud: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    posts[index] = data;
                    renderPostList();
                    alert('Post actualizado exitosamente en el servidor.');
                })
                .catch(error => {
                    console.error('Error al querer actualizar posteo: ', error);
                    alert('Error al querer actualizar posteo: ' + error.message);
                });
        }
    } else {
        alert('Post no encontrado.');
    }
}

// Eliminar un post de la API o del arreglo local
function deletePost(id) {
    // Si el post tiene un ID mayor a 100, lo eliminamos solo localmente
    if (id > 100) {
        posts = posts.filter(post => post.id !== id);
        renderPostList();
        alert('Post eliminado localmente.');
    } else {
        // Eliminar a través de la API
        fetch(`${urlBase}/${id}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (res.ok) {
                    posts = posts.filter(post => post.id !== id);
                    renderPostList();
                } else {
                    alert('Hubo un error y no se pudo eliminar el posteo');
                }
            })
            .catch(error => console.error('Hubo un error: ', error));
    }
}
