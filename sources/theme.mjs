export function initTheme(){
    let btn = document.querySelector("#btn-toggle");

    const currentTheme = localStorage.getItem("theme");
    if (currentTheme==="light-theme"){
        document.body.classList.toggle("light-theme");
    }else if (currentTheme==="dark-theme"){
        btn.checked = true;
        document.body.classList.toggle("dark-theme");
    }else{
        document.body.classList.toggle("light-theme");
    }

    return
    btn.addEventListener('change', function () {
        document.body.classList.remove("black-theme");
        if (this.checked) {
            localStorage.setItem("theme", "dark-theme");
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.add("light-theme");
            localStorage.setItem("theme", "light-theme");
            document.body.classList.remove("dark-theme");
        }
    });
}
