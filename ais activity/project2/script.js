$(document).ready(function () {
    $('#feedback-form').submit(function (event) {
        event.preventDefault();
        var name = $('#name').val();
        var destination = $('#destination').val();
        var feedback = $('#feedback').val();

        if (name === '' || destination === '' || feedback === '') {
            alert('Please fill in all fields');
            return;
        }


        alert('Form submitted successfully!');
    });
});