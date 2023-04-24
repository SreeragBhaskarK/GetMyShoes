function copyCoupon(id) {
    var cpnBtn = document.getElementById("cpnBtn-coupon"+id);
    var cpnCode = document.getElementById("cpnCode-coupon"+id);

    cpnBtn.onclick = function () {
        navigator.clipboard.writeText(cpnCode.innerHTML);
        cpnBtn.innerHTML = "COPIED";
        setTimeout(function () {
            cpnBtn.innerHTML = "COPY CODE";
        }, 3000);
    }

}