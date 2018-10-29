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
