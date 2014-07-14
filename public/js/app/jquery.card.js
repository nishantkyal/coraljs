$.fn.card = function(options)
{
    options = options || {};
    options.clearForm = options.clearForm || true;

    var self = this;

    // Hide the edit card by default
    $('.main-card', self).show();
    $('.edit-card', self).hide();

    self.create = function()
    {
        // Clear the edit form if any of all values and warnings
        if ($('.edit-card form', self) && options.clearForm) {
            $('.edit-card form', self).trigger('reset');
            $('.edit-card form .alert', self).hide();
            try {
                $('.edit-card form', self).data('bootstrapValidator').resetForm();
            } catch (e) {}
        }

        // Hide main card and show edit card
        $('.main-card', self).hide();
        $('.edit-card', self).show();
    };

    self.edit = function(selectedObject, clickedElement)
    {
        populate($('.edit-card form', self), selectedObject);

        // Hide main card and show edit card
        if (clickedElement)
        {
            $(clickedElement).closest('.main-card').hide();
            $('.edit-card', self).detach().insertAfter($(clickedElement).closest('.main-card'));
        }
        else
            $('.main-card', self).hide();
        $('.edit-card', self).show();
    };

    self.cancelEdit = function()
    {
        $('.main-card', self).show();
        $('.edit-card', self).hide();
    };

    // Attach listeners
    $('.createCardBtn', self).click(self.create);
    $('.editCardBtn', self).click(self.edit);
    $('.cancelEditCardBtn', self).click(self.cancelEdit);


    return self;
};