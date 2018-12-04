$(function() {
    if ($('textarea#ta').length) {
         CKEDITOR.replace('ta');
     }
 
     $('a.confirmDeletion').on('click', function () {
         if (!confirm('Confirm deletion'))
             return false;
     });
     
     if ($("[data-fancybox]").length) {
         $("[data-fancybox]").fancybox();
     }    
 
     $(".alert").fadeTo(2000, 500).slideUp(500, function () {
         $(".alert").alert('close');
     });
 });

 function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            $("#imgPreview").attr('src', e.target.result).width(100).height(100);
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

$("#img").change(function() {
    readURL(this);
});