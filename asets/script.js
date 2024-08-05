// const { error } = require("jquery")

async function get_all_posts(url) {
    let req = await fetch(url)
    let data = await req.json()
    if (req.ok) {
        for (let ele in data.data) {
            document.querySelector('.posts').innerHTML +=
                `
        <div class="card bg-body-tertiary mb-3" id="${data.data[ele].id}">
                    <div class="d-flex p-2 align-items-center ">
                        <img src="${data.data[ele].author.profile_image}" width="60px"  alt="" class="rounded-circle d-inline-block m-3 border border-black border-opacity-20" >
                        <h2 class="fs-6 text-capitalize fw-bold">@${data.data[ele].author.name}</h2>
                    </div>
                    <div class="p-3">
                    <img src="${data.data[ele].image}" height=" 300px"  class="card-img-top object-fit-cover" alt="...">
                    <div class="card-body">
                    <p class="card-text"><small class="text-body-secondary">${data.data[ele].created_at
                }</small></p>
                    <p class="card-text">${data.data[ele].body}</p>
                    </div>
                    <hr>
                    <div>
                    <i class="fa-solid fa-pen fa-fade"></i>
                    <span>(${data.data[ele].comments_count}) comment</span>
                    </div>
                    </div>
                  </div>
        `
        }
    }

}
get_all_posts("https://tarmeezacademy.com/api/v1/posts?limit=5")

// ********* login 
let [userName, userPassword, remember, show_form_log] = [document.querySelector('#user_name'), document.querySelector('#user_Password'), document.querySelector('#checkbox'), document.querySelector('#show_form_log')]
show_form_log.addEventListener("click", _ => {
    if (localStorage.getItem("remember")) {
        let loginFeild_data = JSON.parse(localStorage.getItem("remember"))
        userName.value = loginFeild_data.user_n
        userPassword.value = loginFeild_data.user_p
    }
})
async function login(url, e) {
    if (userName.value.length == 0 && userPassword.value.length == 0) {
        e.preventDefault()
    } else {
        if (remember.checked) {
            localStorage.setItem("remember", JSON.stringify({
                user_n: userName.value,
                user_p: userPassword.value
            }))
        } else {
            localStorage.removeItem("remember")
        }
        let rq = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                username: userName.value,
                password: userPassword.value
            }),
            headers: {
                "Accept": 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(data => {
                if (data.errors) {
                    console.log(data);
                    alert(data.message, 'danger')
                } else {
                    localStorage.setItem("token", JSON.stringify(data))
                    ui_login()
                    alert('You have successfully logged in.', 'success')
                    $("#content_login").hide("fast");
                    $(".modal-backdrop").hide()
                }
            }).catch(error => console.log(error))


    }

}
document.querySelector('#login').addEventListener("click", e => {
    login("https://tarmeezacademy.com/api/v1/login", e)
})


function alert(message, type) {
    const alertPlaceholder = document.querySelector('#alert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
        setTimeout(_ => {
            alertPlaceholder.innerHTML = ""
        }, 5000)
    }


    appendAlert(message, type)
}
$("#signOut_btn").click(_ => {
    localStorage.removeItem("token")
    ui_login()
    alert("You have been successfully logged out.", "info")

})
function ui_login() {
    if (localStorage.getItem("token")) {
        $("#login_register").hide();
        $("#signOut").show();
        console.log();
        let user_loginData = JSON.parse(localStorage.getItem("token"))
        // **** nav logo 
        document.querySelector('#nav_logo').innerHTML = user_loginData.user.name
    } else {
        $("#login_register").show();
        $("#signOut").hide();
        document.querySelector('#nav_logo').innerHTML = "social communication"
    }
}

ui_login()
let a = new FormData()

// setTimeout(_=>{
//     let file = document.querySelector('#dd').files[0];
//     console.log(file);
//     a.append("ss",file)
//     console.log(a);
// },8000)


// ! ****************** register start ****************
let [re_user_password, re_user_name, re_user_userName, re_user_img, re_user_email] = [document.querySelector('#re-user-password'), document.querySelector('#re-user-name'), document.querySelector('#re-user-userName'), document.querySelector('#re-user-img'), document.querySelector('#re-user-email')]
async function register() {
    let url = "https://tarmeezacademy.com/api/v1/register"
    let formData = new FormData()
    formData.append("username", re_user_name.value)
    formData.append("password", re_user_password.value)
    if (re_user_img.files.length > 0) {
        formData.append("image", re_user_img.files[0]);
    }
    formData.append("name", re_user_name.value)
    formData.append("email", re_user_email.value)

    axios.post(url,formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
    .then(response => {
        localStorage.setItem("token", JSON.stringify(response.data))
        ui_login()
        alert('You have successfully logged in.', 'success')
        $("#content_register").hide("fast");
        $(".modal-backdrop").hide()
    })
    .catch(error => {
        console.log(error);
        alert(error.response.data.message, 'danger')
    })

}

document.querySelector('#goRegister').addEventListener("click", _ => {
    register()
})
