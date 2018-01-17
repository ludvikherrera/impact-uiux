"use strict";



define('impact-public/app', ['exports', 'ember', 'impact-public/resolver', 'ember-load-initializers', 'impact-public/config/environment'], function (exports, _ember, _impactPublicResolver, _emberLoadInitializers, _impactPublicConfigEnvironment) {

    var App = undefined;

    _ember['default'].MODEL_FACTORY_INJECTIONS = true;

    var root = 'body';
    if (window.document.domain === 'localhost' && window.location.port === '8888' || window.document.domain === 'impactgiveback.org' || window.document.domain === 'lendahandup.flywheelsites.com') {
        root = '#ember-app';
    }

    App = _ember['default'].Application.extend({
        modulePrefix: _impactPublicConfigEnvironment['default'].modulePrefix,
        podModulePrefix: _impactPublicConfigEnvironment['default'].podModulePrefix,
        Resolver: _impactPublicResolver['default'],
        rootElement: root
    });

    (0, _emberLoadInitializers['default'])(App, _impactPublicConfigEnvironment['default'].modulePrefix);

    exports['default'] = App;
});
define('impact-public/components/basic-dropdown', ['exports', 'ember-basic-dropdown/components/basic-dropdown'], function (exports, _emberBasicDropdownComponentsBasicDropdown) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdown['default'];
    }
  });
});
define('impact-public/components/basic-dropdown/content-element', ['exports', 'ember-basic-dropdown/components/basic-dropdown/content-element'], function (exports, _emberBasicDropdownComponentsBasicDropdownContentElement) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdownContentElement['default'];
    }
  });
});
define('impact-public/components/basic-dropdown/content', ['exports', 'ember-basic-dropdown/components/basic-dropdown/content'], function (exports, _emberBasicDropdownComponentsBasicDropdownContent) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdownContent['default'];
    }
  });
});
define('impact-public/components/basic-dropdown/trigger', ['exports', 'ember-basic-dropdown/components/basic-dropdown/trigger'], function (exports, _emberBasicDropdownComponentsBasicDropdownTrigger) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdownTrigger['default'];
    }
  });
});
define('impact-public/components/bootstrap-tooltip', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        tagName: '',
        setupTooltip: (function () {
            _ember['default'].$('[data-toggle="tooltip"]').tooltip();
        }).on('didInsertElement')
    });
});
define('impact-public/components/charity-box-lah', ['exports', 'ember', 'impact-public/utils/track', 'numeral', 'impact-public/models/donations-local'], function (exports, _ember, _impactPublicUtilsTrack, _numeral, _impactPublicModelsDonationsLocal) {
    exports['default'] = _ember['default'].Component.extend({
        isDonating: false,
        learnMore: false,
        donationAdded: false,
        setup: (function () {
            //Check if any donations have been added to the nonprofit. If so, add the donationAdded property
            var donations = this.get('application.donations');
            var charity = this.get('charity');
            if (donations && donations.length > 0) {
                for (var i = 0; i < donations.length; i++) {
                    if (charity.id === donations[i].nonprofit_id) {
                        this.set('donationAdded', true);
                        this.set('isDonating', true);
                        break;
                    }
                }
            }
            this._super();
        }).on('init'),

        actions: {
            addToCart: function addToCart() {
                this.set('has-error', false);
                if (this.get('amount') && (0, _numeral['default'])().unformat(this.get('amount')) >= 10) {
                    var donations = this.get('application.donations');

                    if (donations.length < 25) {
                        var newDonation = _impactPublicModelsDonationsLocal['default'].create({
                            nonprofit_id: this.get('charity.id'),
                            nonprofit_name: this.get('charity.name'),
                            amount: (0, _numeral['default'])(this.get('amount')).format('0,0.00'),
                            dedicate: false,
                            dedicationSelected: '',
                            dedicationName: ''
                        });

                        newDonation = newDonation.save();

                        //Check for Lend a Hand edge case
                        if (newDonation !== 'lendAHandException') {
                            donations.pushObject(newDonation);

                            (0, _impactPublicUtilsTrack['default'])({
                                category: 'donation',
                                action: 'add',
                                label: this.get('name'),
                                value: this.get('amount')
                            });

                            this.set('donationAdded', true);
                            this.set('isDonating', true);
                            this.set('amount', null);
                            this.growl.success('Donation added to cart');
                        }
                    } else {
                        var options = {
                            closeIn: 15000
                        };
                        this.growl.warning('There is a limit of 25 donations ' + 'per cart. Please add more donations in a different transaction.', options);
                    }
                } else {
                    this.set('has-error', true);
                }
            },
            addDonationSuggestionToCart: function addDonationSuggestionToCart() {
                var donationSuggestionAmount = this.get('charity.ghd_donation_suggestion.amount');
                donationSuggestionAmount = donationSuggestionAmount / 100;
                this.set('amount', donationSuggestionAmount);
                this.send('addToCart');
            },
            makeAnother: function makeAnother() {
                this.set('donationAdded', false);
                this.set('amount', null);
            },
            toggleLearnMore: function toggleLearnMore(name) {
                this.toggleProperty('learnMore');
                if (this.get('learnMore')) {
                    (0, _impactPublicUtilsTrack['default'])({
                        category: 'nonprofit',
                        action: 'learn-more',
                        label: name
                    });
                }
            },
            toggleIsDonating: function toggleIsDonating() {
                this.toggleProperty('isDonating');
            }
        }
    });
});
define('impact-public/components/charity-box', ['exports', 'ember', 'impact-public/utils/track', 'numeral', 'impact-public/models/donations-local'], function (exports, _ember, _impactPublicUtilsTrack, _numeral, _impactPublicModelsDonationsLocal) {

    var CharityBoxComponent = _ember['default'].Component.extend({
        isDonating: false,
        learnMore: false,
        donationAdded: false,
        setup: (function () {
            //Check if any donations have been added to the nonprofit. If so, add the donationAdded property
            var donations = this.get('application.donations');
            var charity = this.get('charity');
            if (donations && donations.length > 0) {
                for (var i = 0; i < donations.length; i++) {
                    if (charity.id === donations[i].nonprofit_id) {
                        this.set('donationAdded', true);
                        this.set('isDonating', true);
                        break;
                    }
                }
            }
            this._super();
        }).on('init'),

        actions: {
            addToCart: function addToCart() {
                this.set('has-error', false);
                if (this.get('amount') && (0, _numeral['default'])().unformat(this.get('amount')) >= 10) {
                    var donations = this.get('application.donations');

                    if (donations.length < 25) {
                        var newDonation = _impactPublicModelsDonationsLocal['default'].create({
                            nonprofit_id: this.get('charity.id'),
                            nonprofit_name: this.get('charity.name'),
                            amount: (0, _numeral['default'])(this.get('amount')).format('0,0.00'),
                            dedicate: false,
                            dedicationSelected: '',
                            dedicationName: ''
                        });

                        newDonation = newDonation.save();

                        //Check for Lend a Hand edge case
                        if (newDonation !== 'lendAHandException') {
                            donations.pushObject(newDonation);

                            (0, _impactPublicUtilsTrack['default'])({
                                category: 'donation',
                                action: 'add',
                                label: this.get('name'),
                                value: this.get('amount')
                            });

                            this.set('donationAdded', true);
                            this.set('isDonating', true);
                            this.set('amount', null);
                            this.growl.success('Donation added to cart');
                        }
                    } else {
                        var options = {
                            closeIn: 15000
                        };
                        this.growl.warning('There is a limit of 25 donations ' + 'per cart. Please add more donations in a different transaction.', options);
                    }
                } else {
                    this.set('has-error', true);
                }
            },
            addDonationSuggestionToCart: function addDonationSuggestionToCart() {
                var donationSuggestionAmount = this.get('charity.ghd_donation_suggestion.amount');
                donationSuggestionAmount = donationSuggestionAmount / 100;
                this.set('amount', donationSuggestionAmount);
                this.send('addToCart');
            },
            makeAnother: function makeAnother() {
                this.set('donationAdded', false);
                this.set('amount', null);
            },
            toggleLearnMore: function toggleLearnMore(name) {
                this.toggleProperty('learnMore');
                if (this.get('learnMore')) {
                    (0, _impactPublicUtilsTrack['default'])({
                        category: 'nonprofit',
                        action: 'learn-more',
                        label: name
                    });
                }
            },
            toggleIsDonating: function toggleIsDonating() {
                this.toggleProperty('isDonating');
            }
        }
    });

    exports['default'] = CharityBoxComponent;
});
define('impact-public/components/charity-campaign', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        tagName: 'li',
        classNames: ['list-group-item'],

        isExpanded: false,

        // actions
        actions: {
            expand: function expand() {
                this.toggleIsExpanded();
                return false;
            },
            collapse: function collapse() {
                this.toggleIsExpanded();
            },
            addToCart: function addToCart(amount) {
                if (amount < 10) {
                    this.growl.error('Amount must be at least $10');
                    return;
                }
                this.get('save')(this.get('campaign.id'), this.get('amount'), this.get('campaign.title'));
                this.set('amount', null);
            }
        },
        // functions
        toggleIsExpanded: function toggleIsExpanded() {
            this.toggleProperty('isExpanded');
        }
    });
});
define('impact-public/components/charity-campaigns', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        campaigns_sort_properties: ['id:asc'],
        sortedCampaigns: _ember['default'].computed.sort('campaigns', 'campaigns_sort_properties')
    });
});
define('impact-public/components/charity-list', ['exports', 'ember', 'impact-public/models/organizations', 'impact-public/helpers/charity-list-helper'], function (exports, _ember, _impactPublicModelsOrganizations, _impactPublicHelpersCharityListHelper) {

  var CharityListComponent = _ember['default'].Component.extend({
    manageGhd: _ember['default'].inject.service('manage-ghd'),
    setup: (function () {
      var self = this;
      _impactPublicModelsOrganizations['default'].find().then(function (result) {
        var isGHD = self.get('manageGhd.isGHD') || self.get('forceGHD');

        self.set('orderedGroupedCharities', (0, _impactPublicHelpersCharityListHelper.buildOrderedGroupedCharities)(result.content, isGHD, self.get('mode.is_lah_app')));
      });
    }).on('didInsertElement')
  });

  exports['default'] = CharityListComponent;
});
define('impact-public/components/charity-symbol', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        setupTooltip: (function () {
            if (this.get('showTooltip')) {
                _ember['default'].$('[data-toggle="tooltip"]').tooltip();
            }
        }).on('didInsertElement'),

        icon_class: _ember['default'].computed('typeId', function () {
            var id = this.get('typeId');
            var symbol = '';
            switch (id) {
                case 1:
                    symbol = 'icon-paw';
                    break;
                case 2:
                    symbol = 'icon-paint-brush';
                    break;
                case 3:
                    symbol = "icon-cutlery";
                    break;
                case 4:
                    symbol = 'icon-life-bouy';
                    break;
                case 5:
                    symbol = 'icon-wheelchair';
                    break;
                case 6:
                    symbol = 'icon-graduation-cap';
                    break;
                case 7:
                    symbol = 'icon-faith';
                    break;
                case 8:
                    symbol = 'icon-stethoscope';
                    break;
                case 9:
                    symbol = 'icon-youth';
                    break;
                case 10:
                    symbol = 'icon-dmf';
                    break;
                case 11:
                    symbol = 'icon-impact';
                    break;
                case 12:
                    symbol = 'icon-seniorcare';
                    break;
            }
            return symbol;
        })
    });
});
define('impact-public/components/checkbox-option', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        parent: _ember['default'].computed.alias('parentView')
    });
});
define('impact-public/components/count-down', ['exports', 'ember', 'impact-public/config/environment'], function (exports, _ember, _impactPublicConfigEnvironment) {

    /* global $ */

    var CountdownComponent = _ember['default'].Component.extend({
        setupCountdown: (function () {
            $('.nav').css('height', '52px').addClass('thankyou-nav').find('a').hide();

            var self = this;
            var counter = $('#the_final_countdown').countdown(_impactPublicConfigEnvironment['default'].startGivingHeartsDay * 1000);
            counter.on('update.countdown', function (event) {
                if (event.strftime('%-D') > 0) {
                    $(this).html(event.strftime('%-D day%!D %H:%M:%S'));
                } else if (event.strftime('%H') > 0) {
                    $(this).html(event.strftime('%H:%M:%S'));
                } else if (event.strftime('%M') > 0) {
                    $(this).html(event.strftime('%M:%S'));
                } else {
                    $(this).html(event.strftime('%S'));
                }
            });
            counter.on('finish.countdown', function () {
                if (document.domain === 'givingheartsday.com' || document.domain === 'www.givingheartsday.com' || document.domain === 'http://www.givingheartsday.com') {
                    document.location = 'https://giving.impactgiveback.org';
                } else {
                    $(this).html("...");
                    self.sendAction();
                    $('.nav').css('height', '').removeClass('thankyou-nav').find('a').fadeIn();
                }
            });
        }).on('didInsertElement')
    });

    exports['default'] = CountdownComponent;
});
define('impact-public/components/credit-card-input', ['exports', 'ember-inputmask/components/credit-card-input'], function (exports, _emberInputmaskComponentsCreditCardInput) {
  exports['default'] = _emberInputmaskComponentsCreditCardInput['default'];
});
define('impact-public/components/credit-card', ['exports', 'ember-credit-card/components/credit-card'], function (exports, _emberCreditCardComponentsCreditCard) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCreditCardComponentsCreditCard['default'];
    }
  });
});
define('impact-public/components/currency-input', ['exports', 'ember-inputmask/components/currency-input'], function (exports, _emberInputmaskComponentsCurrencyInput) {
  exports['default'] = _emberInputmaskComponentsCurrencyInput['default'];
});
define('impact-public/components/customize-donation', ['exports', 'ember', 'numeral', 'impact-public/models/donations-local'], function (exports, _ember, _numeral, _impactPublicModelsDonationsLocal) {

    var CustomizeDonationComponent = _ember['default'].Component.extend({
        dedicationOptions: ['In Honor Of', 'In Memory Of'],
        showEditAmount: false,
        previousAmount: null,
        hasError: false,
        recurringInterval: 'monthly',

        setDonation: (function () {
            this._super();
            if (this.get('donation').save === undefined) {
                this.set('donation', _impactPublicModelsDonationsLocal['default'].create(this.get('donation')));
            }
        }).on('init'),

        actions: {
            editAmount: function editAmount() {
                if (!this.get('showEditAmount')) {
                    this.set('previousAmount', this.get('donation.amount'));
                }
                this.toggleProperty('showEditAmount');
            },

            saveEdit: function saveEdit() {
                this.set('hasError', false);
                if (!this.get('donation.amount') || (0, _numeral['default'])().unformat(this.get('donation.amount')) <= 10) {
                    this.set('hasError', true);
                    this.set('donation.amount', this.get('previousAmount'));
                } else {
                    this.set('hasError', false);
                    this.set('showEditAmount', false);
                    this.get('donation').save();
                }
            },

            selectDedication: function selectDedication(selection) {
                this.set('donation.dedicationSelected', selection);
                this.get('donation').save();
            },

            saveName: function saveName() {
                _ember['default'].run.debounce(this, this.saveDonation, 800);
            },

            saveDesignation: function saveDesignation() {
                _ember['default'].run.debounce(this, this.saveDonation, 800);
            },

            saveNameNow: function saveNameNow() {
                this.saveDonation();
            },

            removeDonation: function removeDonation(donation) {
                this.sendAction('action', donation);
            },

            saveInterval: function saveInterval(interval) {
                this.set('recurringInterval', interval);
                this.set('donation.recurringInterval', interval);
                this.get('donation').save();
            },

            setDedication: function setDedication() {
                this.set('donation.dedicate', !this.get('donation.dedicate'));
                if (this.get('donation.dedicate') && !this.get('dedicationSelected')) {
                    this.set('donation.dedicationSelected', 'In Honor Of');
                    this.get('donation').save();
                } else {
                    this.set('donation.dedicate', false);
                    this.set('donation.dedicationSelected', '');
                    this.get('donation').save();
                }
            },
            setDonationComment: function setDonationComment() {
                this.get('donation').save();
            },
            setDonationHideAmount: function setDonationHideAmount(val) {
                this.set('donation.hide_comment_donation_amount', val);
                this.get('donation').save();
            }
        },

        saveDonation: function saveDonation() {
            this.get('donation').save();
        },

        setRecurring: (function () {
            if (this.get('donation.recurring')) {
                this.set('donation.recurringInterval', this.get('recurringInterval'));
            } else {
                this.set('donation.recurringInterval', null);
            }
            this.get('donation').save();
        }).observes('donation.recurring')
    });

    exports['default'] = CustomizeDonationComponent;
});
define('impact-public/components/date-input', ['exports', 'ember-inputmask/components/date-input'], function (exports, _emberInputmaskComponentsDateInput) {
  exports['default'] = _emberInputmaskComponentsDateInput['default'];
});
define('impact-public/components/donation-cart', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        setup: (function () {
            _ember['default'].$('[data-toggle="tooltip"]').tooltip();
        }).on('didInsertElement'),

        recurringInterval: _ember['default'].computed('donation.recurring', 'donation.recurringInterval', function () {
            if (this.get('donation.recurring')) {
                var interval = this.get('donation.recurringInterval');
                var capInterval = interval.charAt(0).toUpperCase() + interval.slice(1);
                return capInterval;
            } else {
                return '';
            }
        })
    });
});
define('impact-public/components/donation-comment', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('impact-public/components/donation-thermometer', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    didReceiveAttrs: function didReceiveAttrs() {
      this._super();

      var _get = this.get('donations');

      var donationsTotal = _get.donationsTotal;
      var boostTotal = _get.boostTotal;
      var boostAmount = _get.boostAmount;
      var boostInterval = _get.boostInterval;

      var goal = this.get('goal');
      var donationArray = this.createDonationArray(donationsTotal, boostAmount, boostInterval);
      //const donationPercentages = this.createDonationPercentageArray(donationArray);
      var remaining = goal - (donationsTotal + boostTotal);

      // console.log('remaining: ', remaining);
      console.log('donation array: ', donationArray);
      // console.log('donations: ', this.get('donations'));
      // this.set('donationPercentages', this.get('donations').map( (donation) => {
      //   const percentage = (donation / this.get('goal')) * 10;
      //   console.log('percentage: ', percentage);
      //   return Math.floor(percentage);
      // }));
      this.set('donationArray', donationArray);
      // this.set('donationPercentages', donationPercentages);
      this.set('remaining', remaining);
      // this.set('donationArrowTop', this.calculateArrowTop(donationPercentages));
      // this.set('donationArrowTop', 100 - this.get('donationPercentages').reduce( (total, donation) => total += donation ) );
      // console.log('donation arrow top', this.get('donationArrowTop'));
    },
    createDonationPercentageArray: function createDonationPercentageArray(donations) {
      var _this = this;

      return donations.map(function (donation) {
        var percentage = donation / _this.get('goal') * 100;
        return percentage;
      });
    },
    createDonationArray: function createDonationArray(total, boostAmount, boostInterval) {
      var donationArray = [];
      while (total > 0) {
        if (total >= boostInterval) {
          donationArray.push({
            percentage: boostAmount / this.get('goal') * 100,
            amount: boostAmount,
            isBoost: true
          });
          donationArray.push({
            amount: boostInterval,
            percentage: boostInterval / this.get('goal') * 100
          });
          total -= boostInterval;
        } else {
          donationArray.push({
            amount: total,
            percentage: total / this.get('goal') * 100
          });
          total -= total;
        }
      }
      console.log('donationArray', donationArray);
      return donationArray;
    },
    calculateArrowTop: function calculateArrowTop(donations) {
      return Math.min(100 - donations.reduce(function (total, donation) {
        return total += donation;
      }), 90);
    }
  });
});
define('impact-public/components/e-card', ['exports', 'ember', 'impact-public/utils/api'], function (exports, _ember, _impactPublicUtilsApi) {
    exports['default'] = _ember['default'].Component.extend({
        analytics: _ember['default'].inject.service(),
        emailDonations: _ember['default'].computed.filterBy('donations', 'includeDonation'),

        actions: {
            sendEmail: function sendEmail() {
                var self = this;
                this.set('alerts', []);
                if (!this.get('email')) {
                    this.get('alerts').pushObject('Please provide an email address');
                }
                if (!this.get('message')) {
                    this.get('alerts').pushObject('Please provide a message');
                }
                if (this.get('alerts').length === 0) {
                    if (this.get('emailDonations').length <= 0) {
                        if (!confirm('You did not select any donations to include in your email. \nWould you like to send the email anyway?')) {
                            return;
                        }
                    }
                    var donations = [];
                    if (this.get('emailDonations').length > 0) {
                        _.each(this.get('emailDonations'), function (value) {
                            var donation = '';
                            donation += value.nonprofit_name;
                            if (value.dedicate) {
                                donation += ' - ' + value.dedicationSelected + ': ' + value.dedicationName;
                            }
                            donations.push(donation);
                        });
                    }

                    _impactPublicUtilsApi['default'].post('/giving/email', {
                        message: this.get('message'),
                        emails: this.get('email'),
                        fromName: this.get('fromName'),
                        donations: donations
                    }, function (json) {
                        if (json && json.error) {
                            console.log(json.error);
                            self.get('alerts').pushObject('There was a problem sending your email. Please try again.');
                        } else {
                            self.get('analytics').track({
                                category: 'share',
                                action: 'e-card'
                            });

                            self.set('showEcard', false);
                            self.growl.success('E-Card Sent');
                            self.set('emailSent', true);
                            self.set('message', '');
                            self.set('fromName', '');
                            self.set('email', '');
                            self.get('donations').setEach('includeDonation', false);
                        }
                    });
                }
            },
            cancel: function cancel() {
                this.sendAction();
            },
            sendAnother: function sendAnother() {
                this.toggleProperty('emailSent');
            }
        }
    });
});
/* global _ */
define('impact-public/components/email-input', ['exports', 'ember-inputmask/components/email-input'], function (exports, _emberInputmaskComponentsEmailInput) {
  exports['default'] = _emberInputmaskComponentsEmailInput['default'];
});
define('impact-public/components/ember-wormhole', ['exports', 'ember-wormhole/components/ember-wormhole'], function (exports, _emberWormholeComponentsEmberWormhole) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberWormholeComponentsEmberWormhole['default'];
    }
  });
});
define('impact-public/components/floating-cart', ['exports', 'ember', 'numeral'], function (exports, _ember, _numeral) {

    var FloatingCartComponent = _ember['default'].Component.extend({
        tagName: '',
        stickyCart: (function () {
            $('#cart-panel').stick_in_parent({
                parent: '#charity-area',
                offset_top: 100
            });
        }).on('didInsertElement'),

        actions: {
            setNameFilter: function setNameFilter(charity) {
                this.sendAction('action', charity);
            },
            resendReceipts: function resendReceipts() {
                this.sendAction('resendReceipts', this.get('email'));
            }
        },

        cartTotal: (function () {
            var donations = this.get('donations');
            if (donations) {
                if (donations.length > 0) {
                    var amounts = _.pluck(donations, 'amount');
                    var total = 0;
                    _.each(amounts, function (element) {
                        if (element) {
                            element = parseFloat((0, _numeral['default'])().unformat(element));
                            total += element;
                        }
                    });
                    return total.toFixed(2);
                }
            }
            return '0.00';
        }).property('donations.[].amount')
    });

    exports['default'] = FloatingCartComponent;
});
/* global $ */
/* global _ */
define('impact-public/components/growl-notification', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        open: (function () {
            this.$().hide().fadeIn();

            if (!this.get('notification.options.clickToDismiss')) {
                _ember['default'].run.later(this, this.destroyAlert, this.get('notification.options.closeIn'));
            }
        }).on('didInsertElement'),

        click: function click() {
            if (this.get('notification.options.clickToDismiss')) {
                this.destroyAlert();
            }
        },

        type: (function () {
            return this.get('notification.options.type');
        }).property(),

        alertType: (function () {
            var type = this.get('type');
            if (type === 'error') {
                type = 'danger';
            }
            return 'alert-' + type;
        }).property('type'),

        destroyAlert: function destroyAlert() {
            var self = this;
            if (this.$()) {
                this.$().fadeOut(_ember['default'].run(this, function () {
                    // send the action on up so the manager can remove this item from array
                    self.sendAction('action', self.get('notification'));
                }));
            } else {
                self.sendAction('action', self.get('notification'));
            }
        }
    });
});
define('impact-public/components/growl-notifications-manager', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        actions: {
            dismiss: function dismiss(notification) {
                this.get('notifications').removeObject(notification);
            }
        }
    });
});
define('impact-public/components/input-mask', ['exports', 'ember-inputmask/components/input-mask'], function (exports, _emberInputmaskComponentsInputMask) {
  exports['default'] = _emberInputmaskComponentsInputMask['default'];
});
define('impact-public/components/link-to-track', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        tagName: 'a',
        analytics: _ember['default'].inject.service(),

        didInsertElement: function didInsertElement() {
            var self = this;
            this.$().find('a').click(function () {
                self.handleTrack();
            });
        },

        handleTrack: function handleTrack() {
            this.get('analytics').track({
                category: this.get('category'),
                action: this.get('action'),
                label: this.get('label'),
                value: this.get('value')
            });
        }

    });
});
define('impact-public/components/location-filter', ['exports', 'ember'], function (exports, _ember) {

    /* global $ */

    var LocationFilterComponent = _ember['default'].Component.extend({
        milesOptions: [5, 10, 15, 20],
        miles: 5,

        didInsertElement: function didInsertElement() {
            $('a[href$="#collapse-location"]').click(function () {
                if (!$('#collapse-location').hasClass('collapsing')) {
                    var span = $(this).find('span');
                    if (span.hasClass('glyphicon-plus-sign')) {
                        $(this).find('span').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    } else {
                        $(this).find('span').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    }
                }
            });
        },

        actions: {
            postCodeSearch: function postCodeSearch() {
                var _getProperties = this.getProperties('zip', 'miles');

                var zip = _getProperties.zip;
                var miles = _getProperties.miles;

                this.get('onSubmit')(zip, miles);
            }
        }
    });

    exports['default'] = LocationFilterComponent;
});
define('impact-public/components/main-nav', ['exports', 'ember'], function (exports, _ember) {

    /* global $ */

    exports['default'] = _ember['default'].Component.extend({
        setupShrinkNav: (function () {
            $(window).scroll(function () {
                if ($(document).scrollTop() > 50) {
                    $('nav').addClass('shrink');
                } else {
                    $('nav').removeClass('shrink');
                }
            });

            // we want to make sure 'this' inside `didScroll` refers
            // to the HomeView, so we use jquery's `proxy` method to bind it
            $(window).on('scroll', $.proxy(this.didScroll, this));
        }).on('didInsertElement'),

        actions: {
            scrollTo: function scrollTo(anchor) {
                this.sendAction('action', anchor);
            }
        }
    });
});
define('impact-public/components/number-input', ['exports', 'ember-inputmask/components/number-input'], function (exports, _emberInputmaskComponentsNumberInput) {
  exports['default'] = _emberInputmaskComponentsNumberInput['default'];
});
define('impact-public/components/phone-number-input', ['exports', 'ember-inputmask/components/phone-number-input'], function (exports, _emberInputmaskComponentsPhoneNumberInput) {
  exports['default'] = _emberInputmaskComponentsPhoneNumberInput['default'];
});
define('impact-public/components/power-select-multiple', ['exports', 'ember-power-select/components/power-select-multiple'], function (exports, _emberPowerSelectComponentsPowerSelectMultiple) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectMultiple['default'];
    }
  });
});
define('impact-public/components/power-select-multiple/trigger', ['exports', 'ember-power-select/components/power-select-multiple/trigger'], function (exports, _emberPowerSelectComponentsPowerSelectMultipleTrigger) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectMultipleTrigger['default'];
    }
  });
});
define('impact-public/components/power-select', ['exports', 'ember-power-select/components/power-select'], function (exports, _emberPowerSelectComponentsPowerSelect) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelect['default'];
    }
  });
});
define('impact-public/components/power-select/before-options', ['exports', 'ember-power-select/components/power-select/before-options'], function (exports, _emberPowerSelectComponentsPowerSelectBeforeOptions) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectBeforeOptions['default'];
    }
  });
});
define('impact-public/components/power-select/options', ['exports', 'ember-power-select/components/power-select/options'], function (exports, _emberPowerSelectComponentsPowerSelectOptions) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectOptions['default'];
    }
  });
});
define('impact-public/components/power-select/placeholder', ['exports', 'ember-power-select/components/power-select/placeholder'], function (exports, _emberPowerSelectComponentsPowerSelectPlaceholder) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectPlaceholder['default'];
    }
  });
});
define('impact-public/components/power-select/power-select-group', ['exports', 'ember-power-select/components/power-select/power-select-group'], function (exports, _emberPowerSelectComponentsPowerSelectPowerSelectGroup) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectPowerSelectGroup['default'];
    }
  });
});
define('impact-public/components/power-select/search-message', ['exports', 'ember-power-select/components/power-select/search-message'], function (exports, _emberPowerSelectComponentsPowerSelectSearchMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectSearchMessage['default'];
    }
  });
});
define('impact-public/components/power-select/trigger', ['exports', 'ember-power-select/components/power-select/trigger'], function (exports, _emberPowerSelectComponentsPowerSelectTrigger) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectTrigger['default'];
    }
  });
});
define('impact-public/components/recurring-donation-row', ['exports', 'ember', 'numeral', 'impact-public/utils/api'], function (exports, _ember, _numeral, _impactPublicUtilsApi) {
    exports['default'] = _ember['default'].Component.extend({
        tagName: '',

        processing_percentage: 0.029,
        transaction_charge: 0.30,

        processingChargeAmount: (function () {
            if (this.get('recurringDonation.processing_charges_paid')) {
                //Add 2.9% and $0.3 for the cart
                var processing_percentage = this.get('processing_percentage');
                var transaction_charge = this.get('transaction_charge');

                var newAmount = (0, _numeral['default'])().unformat(this.get('recurringDonation.dollarAmount'));
                //Convert to cents
                var processingCharges = newAmount * processing_percentage;
                processingCharges = processingCharges + transaction_charge;
                //convert to cents and round
                processingCharges = Math.round(processingCharges * 100);

                return processingCharges;
            }
            return 0;
        }).property('recurringDonation.processing_charges_paid', 'recurringDonation.dollarAmount'),

        actions: {
            showConfirmation: function showConfirmation() {
                this.set('showConfirmation', true);
            },
            hideConfirmation: function hideConfirmation() {
                this.set('showConfirmation', false);
            },
            cancelRecurring: function cancelRecurring(recurring_donation) {
                this.sendAction('action', recurring_donation);
            },
            editAmount: function editAmount() {
                this.set('editingAmount', true);
            },
            saveAmount: function saveAmount() {
                var newAmount = this.get('recurringDonation.dollarAmount');
                newAmount = (0, _numeral['default'])().unformat(newAmount);
                //Convert to cents
                newAmount = newAmount * 100;
                var quantity = newAmount + this.get('processingChargeAmount');
                if (newAmount <= 50) {
                    this.growl.error('Your donation has to be more than 50 cents');
                } else {
                    var _this = this;
                    this.set('disable', true);
                    this.set('savingAmount', true);
                    _impactPublicUtilsApi['default'].post('/recurring_donations/change-amount', {
                        recurring_id: this.get('recurringDonation.id'),
                        subscription_id: this.get('recurringDonation.subscription_id'),
                        quantity: quantity,
                        amount: newAmount,
                        processing_charges_paid: this.get('recurringDonation.processing_charges_paid'),
                        processing_charges_amount: this.get('processingChargeAmount')
                    }, function (json) {
                        if (json.error) {
                            _this.growl.error(json.error);
                        } else {
                            _this.set('recurringDonation.quantity', parseInt(json.result.quantity, 10));
                            _this.set('recurringDonation.processing_charges_amount', parseInt(json.result.processing_charges_amount, 10));
                            _this.set('recurringDonation.processing_charges_paid', json.result.processing_charges_paid);
                            _this.set('recurringDonation.amount', parseInt(json.result.amount, 10));
                            _this.growl.success('Your recurring donation has been updated.');
                            _this.set('editingAmount', false);
                        }
                        _this.set('disable', false);
                        _this.set('savingAmount', false);
                    }, true);
                }
            },
            cancelEditAmount: function cancelEditAmount() {
                this.set('editingAmount', false);
                var oldAmount = this.get('recurringDonation.amount');
                this.set('recurringDonation.dollarAmount', (oldAmount / 100).toFixed(2));
            },
            setPayingCharges: function setPayingCharges(value) {
                this.set('recurringDonation.processing_charges_paid', value);
            }
        }
    });
});
define('impact-public/components/refund-impact', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('impact-public/components/refund-lah', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('impact-public/components/scroll-load', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        setup: (function () {
            _ember['default'].$(window).on('scroll', _ember['default'].$.proxy(this.didScroll, this));
        }).on('didInsertElement'),

        willDestroyElement: function willDestroyElement() {
            // have to use the same argument to `off` that we did to `on`
            _ember['default'].$(window).off('scroll', _ember['default'].$.proxy(this.didScroll, this));
        },

        // this is called every time we scroll
        didScroll: function didScroll() {
            if (this.isScrolledToBottom()) {
                if (!this.get('noMore')) {
                    this.sendAction();
                }
            }
        },

        // we check if we are at the bottom of the page
        isScrolledToBottom: function isScrolledToBottom() {
            if (this.$().length) {
                var wH = _ember['default'].$(window).height(),
                    wS = _ember['default'].$(document).scrollTop(),
                    dH = _ember['default'].$(document).height();
                //hT = this.$().offset().top,
                //hH = this.$().outerHeight(),

                //console.log("offset", hT);
                //console.log("outerheight", hH);
                //console.log("window hieght", wH);
                //console.log('scropttt', wS);
                //console.log('doc height', dH);

                if (wS === 0) {
                    return false;
                }
                //if (wS > (hT + hH - wH)) {
                //    return false;
                //}
                // ((wintop/(docheight-winheight)) > scrolltrigger)

                if (wS / (dH - wH) > 0.85) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    });
});
define('impact-public/components/ssn-input', ['exports', 'ember-inputmask/components/ssn-input'], function (exports, _emberInputmaskComponentsSsnInput) {
  exports['default'] = _emberInputmaskComponentsSsnInput['default'];
});
define('impact-public/components/state-select', ['exports', 'ember'], function (exports, _ember) {

    var StateSelectComponent = _ember['default'].Component.extend({
        overrideClass: '',
        usStatesList: [{ "value": "AL", "label": "Alabama" }, { "value": "AK", "label": "Alaska" }, { "value": "AZ", "label": "Arizona" }, { "value": "AR", "label": "Arkansas" }, { "value": "CA", "label": "California" }, { "value": "CO", "label": "Colorado" }, { "value": "CT", "label": "Connecticut" }, { "value": "DC", "label": "District of Columbia" }, { "value": "DE", "label": "Delaware" }, { "value": "FL", "label": "Florida" }, { "value": "GA", "label": "Georgia" }, { "value": "HI", "label": "Hawaii" }, { "value": "ID", "label": "Idaho" }, { "value": "IL", "label": "Illinois" }, { "value": "IN", "label": "Indiana" }, { "value": "IA", "label": "Iowa" }, { "value": "KS", "label": "Kansas" }, { "value": "KY", "label": "Kentucky" }, { "value": "LA", "label": "Louisiana" }, { "value": "ME", "label": "Maine" }, { "value": "MD", "label": "Maryland" }, { "value": "MA", "label": "Massachusetts" }, { "value": "MI", "label": "Michigan" }, { "value": "MN", "label": "Minnesota" }, { "value": "MS", "label": "Mississippi" }, { "value": "MO", "label": "Missouri" }, { "value": "MT", "label": "Montana" }, { "value": "NE", "label": "Nebraska" }, { "value": "NV", "label": "Nevada" }, { "value": "NH", "label": "New Hampshire" }, { "value": "NJ", "label": "New Jersey" }, { "value": "NM", "label": "New Mexico" }, { "value": "NY", "label": "New York" }, { "value": "NC", "label": "North Carolina" }, { "value": "ND", "label": "North Dakota" }, { "value": "OH", "label": "Ohio" }, { "value": "OK", "label": "Oklahoma" }, { "value": "OR", "label": "Oregon" }, { "value": "PA", "label": "Pennsylvania" }, { "value": "RI", "label": "Rhode Island" }, { "value": "SC", "label": "South Carolina" }, { "value": "SD", "label": "South Dakota" }, { "value": "TN", "label": "Tennessee" }, { "value": "TX", "label": "Texas" }, { "value": "UT", "label": "Utah" }, { "value": "VT", "label": "Vermont" }, { "value": "VA", "label": "Virginia" }, { "value": "WA", "label": "Washington" }, { "value": "WV", "label": "West Virginia" }, { "value": "WI", "label": "Wisconsin" }, { "value": "WY", "label": "Wyoming" }, { "value": "AS", "label": "American Samoa" }, { "value": "GU", "label": "Guam" }, { "value": "MP", "label": "Northern Mariana Islands" }, { "value": "PR", "label": "Puerto Rico" }, { "value": "UM", "label": "United States Minor Outlying Islands" }, { "value": "VI", "label": "Virgin Islands" }],
        caProvinceList: [{ "value": "AB", "label": "Alberta" }, { "value": "BC", "label": "British Columbia" }, { "value": "MB", "label": "Manitoba" }, { "value": "NB", "label": "New Brunswick" }, { "value": "NL", "label": "Newfoundland and Labrador" }, { "value": "NS", "label": "Nova Scotia" }, { "value": "NU", "label": "Nunavut" }, { "value": "NW", "label": "Northwest Territories" }, { "value": "ON", "label": "Ontario" }, { "value": "PE", "label": "Prince Edward Island" }, { "value": "QC", "label": "Quebec" }, { "value": "SK", "label": "Saskatchewan" }, { "value": "YU", "label": "Yukon" }],

        didInsertElement: function didInsertElement() {
            if (!this.get('overrideClass')) {
                this.set('overrideClass', 'form-control');
            }
        },

        actions: {
            selectState: function selectState(selection) {
                this.set('selectedState', selection);
            }
        }

        //*****Adds Select2
        // didInsertElement: function() {
        //     var width = "resolve";
        //     if (this.get('width') !== undefined) {
        //         width = this.get('width');
        //     }
        //     this.$().children().select2({
        //         width: width
        //     });
        // },
    });

    exports['default'] = StateSelectComponent;
});
define('impact-public/components/track-checkbox', ['exports', 'ember'], function (exports, _ember) {

    var TrackCheckboxComponent = _ember['default'].Component.extend({
        trackOn: true,
        selected: false,
        analytics: _ember['default'].inject.service(),

        didInsertElement: function didInsertElement() {
            this.set('checked', this.get('selected'));
        },

        onChange: (function () {
            if (this.get('checked') === this.get('trackOn')) {
                this.get('analytics').track({
                    category: this.get('category'),
                    action: this.get('action'),
                    label: this.get('label')
                });
            }
            if (this.get('checked')) {
                this.set('selected', true);
            } else {
                this.set('selected', false);
            }
        }).on('change'),

        onSelected: (function () {
            this.set('checked', this.get('selected'));
        }).observes('selected')
    });

    exports['default'] = TrackCheckboxComponent;
});
define('impact-public/components/type-filter', ['exports', 'ember'], function (exports, _ember) {

    /* global $ */

    var TypeFilterComponent = _ember['default'].Component.extend({
        didInsertElement: function didInsertElement() {
            $('a[href$="#collapse-type"]').click(function () {
                if (!$('#collapse-type').hasClass('collapsing')) {
                    var span = $(this).find('span');
                    if (span.hasClass('glyphicon-plus-sign')) {
                        $(this).find('span').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    } else {
                        $(this).find('span').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    }
                }
            });
        },

        sortedTypes: _ember['default'].computed.sort('types', function (a) {
            if (a.name === 'DMF Funds' || a.name === 'Impact Funds') {
                return 1;
            } else {
                return -1;
            }
        })
    });

    exports['default'] = TypeFilterComponent;
});
define('impact-public/components/validated-formgroup', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({

        errorState: null,
        activeValidation: false,

        didInsertElement: function didInsertElement() {
            this._super();
            _ember['default'].run.scheduleOnce('afterRender', this, this.afterRenderEvent);
        },

        afterRenderEvent: function afterRenderEvent() {
            var self = this;

            this.$('.validate').each(function (i, e) {
                var $e = self.$(e);
                $e.on('keyup', function () {
                    self.send('keyUp', $e.val());
                }).on('focusout', function () {
                    self.send('focusOut', $e.val());
                });
            });
        },

        validate: function validate(value) {
            if (this.didValidate(value)) {
                this.set('errorState', 'has-success');
            } else {
                this.set('errorState', 'has-error');
                this.set('helper', this.get('errorHelper'));
            }
        },

        didValidate: function didValidate(value) {
            return value === "Testing";
        },

        actions: {
            keyUp: function keyUp(value) {
                if (this.get('activeValidation')) {
                    this.validate(value);
                }

                this.sendAction();
            },

            focusOut: function focusOut(value) {
                this.set('activeValidation', true);
                this.validate(value);
            }
        }

    });
});
define('impact-public/components/video-frame', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        tagName: ''
    });
});
define('impact-public/components/view-receipt', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        manageGhd: _ember['default'].inject.service('manage-ghd'),

        amountLabel: (function () {
            this.get('donations').forEach(function (donation) {
                if (typeof donation.amount === 'string') {
                    donation.amountLabel = donation.amount;
                } else {
                    donation.amountLabel = (donation.amount / 100).toFixed(2);
                }
            });
        }).on('init'),

        processingChargesLabel: _ember['default'].computed('transaction.processing_charge', 'donations.[]', function () {
            var processingCharges = this.get('transaction.processing_charge');
            if (processingCharges) {
                if (typeof processingCharges === 'string') {
                    return this.get('transaction.processing_charge');
                } else if (processingCharges) {
                    return (this.get('transaction.processing_charge') / 100).toFixed(2);
                }
            } else if (this.get('donations')[0].processing_charge) {
                return (this.get('processingChargesTotal') / 100).toFixed(2);
            }
            return null;
        }),

        chargeAmountLabel: _ember['default'].computed('transaction.charge_amount', 'donations.[]', function () {
            var totalAmount = this.get('transaction.charge_amount');
            if (totalAmount) {
                if (typeof totalAmount === 'string') {
                    return this.get('transaction.charge_amount');
                } else {
                    return (this.get('transaction.charge_amount') / 100).toFixed(2);
                }
            } else {
                return this.get('totalDonated');
            }
        }),

        setAmountLabels: (function () {}).on('didInsertElement'),

        actions: {
            printReceipt: function printReceipt() {
                window.print();
            },
            toggleViewReceipt: function toggleViewReceipt() {
                this.sendAction();
            }
        },

        processingChargesTotal: (function () {
            var total = 0;
            _.each(this.get('donations'), function (item) {
                if (item.processing_charge) {
                    total += item.processing_charge;
                }
            });
            return total;
        }).property('donations.[]'),

        totalDonated: (function () {
            var total = 0;
            _.each(this.get('donations'), function (item) {
                total += item.amount;
                if (item.processing_charge) {
                    total += item.processing_charge;
                }
            });
            return parseInt(total);
        }).property('donations.[]')
    });
});
/* global _ */
define('impact-public/components/volunteer-box', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        learnMore: false,

        didInsertElement: function didInsertElement() {

            var div = this.$('.hide').removeClass('hide');
            div.css('height', div.height());
            var c = div.children();
            c.hide().fadeIn('slow', function () {
                _ember['default'].$(this).addClass('show');
                div.height('auto');
            });
        },

        actions: {
            toggleLearnMore: function toggleLearnMore() {
                this.toggleProperty('learnMore');
            }
        },

        trimmedDescription: _ember['default'].computed('opportunity.description', function () {
            var desc = this.get('opportunity.description');

            if (desc.length > 250) {
                return desc.substring(0, 250) + '...';
            }
            return desc;
        }),

        willDestroyElement: function willDestroyElement() {
            var div = this.$('.show').removeClass('show');
            div.css('height', div.height());
            var c = div.children();
            c.fadeOut('slow');
        }
    });
});
define('impact-public/components/volunteer-sidebar-search', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        actions: {
            clearSearchFilters: function clearSearchFilters() {
                this.get('clearFilters')();
            }
        }
    });
});
define('impact-public/components/volunteer-sidebar-skills', ['exports', 'ember'], function (exports, _ember) {

    /* global $ */

    exports['default'] = _ember['default'].Component.extend({
        didInsertElement: function didInsertElement() {
            $('a[href$="#collapse-type"]').click(function () {
                if (!$('#collapse-type').hasClass('collapsing')) {
                    var span = $(this).find('span');
                    if (span.hasClass('glyphicon-plus-sign')) {
                        $(this).find('span').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    } else {
                        $(this).find('span').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    }
                }
            });
        },

        actions: {
            skills_handler: function skills_handler(skill_name, event) {
                var checked = event.target.checked;
                var options_checked = this.get('skill_options_checked');
                if (checked) {
                    options_checked.pushObject(skill_name);
                    this.get('skills').findBy('skill', skill_name).set('checked', true);
                } else {
                    options_checked = options_checked.without(skill_name);
                    this.get('skills').findBy('skill', skill_name).set('checked', false);
                }
                this.set('skill_options_checked', options_checked);
                //this.parentView.filterContent();
            }
        }
    });
});
define('impact-public/components/volunteer-sidebar-time-commitment', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({

        actions: {
            time_commitments_handler: function time_commitments_handler(commitment_name, event) {
                var checked = event.target.checked;
                var options_checked = this.get('time_commitment_options_checked');
                if (checked) {
                    options_checked.push(commitment_name);
                } else {
                    options_checked = options_checked.without(commitment_name);
                }
                this.set('time_commitment_options_checked', options_checked);
                this.parentView.filterContent();
            }
        }
    });
});
define('impact-public/components/volunteer-sidebar-type', ['exports', 'ember'], function (exports, _ember) {

    /* global $ */

    exports['default'] = _ember['default'].Component.extend({
        didInsertElement: function didInsertElement() {
            $('a[href$="#collapse-skills"]').click(function () {
                if (!$('#collapse-type').hasClass('collapsing')) {
                    var span = $(this).find('span');
                    if (span.hasClass('glyphicon-plus-sign')) {
                        $(this).find('span').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    } else {
                        $(this).find('span').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    }
                }
            });
        },

        options_checked: [],

        sortedTypes: _ember['default'].computed.sort('types', function (a) {
            if (a.name === 'DMF Funds' || a.name === 'Impact Funds') {
                return 1;
            } else {
                return -1;
            }
        }),

        actions: {
            type_handler: function type_handler(type_name, event) {
                var checked = event.target.checked;
                var options_checked = this.get('type_options_checked');
                if (checked) {
                    //Ember.$(event.target).parents('.aj-type-label').find('.icons-typesearch').addClass('type-selected');
                    if (!options_checked.contains(type_name)) {
                        options_checked.pushObject(type_name);
                    }
                    this.get('types').findBy('name', type_name).set('isSelected', true);
                } else {
                    //Ember.$(event.target).parents('.aj-type-label').find('.icons-typesearch').removeClass('type-selected');
                    options_checked = options_checked.without(type_name);
                    this.get('types').findBy('name', type_name).set('isSelected', false);
                }
                this.set('type_options_checked', options_checked);
                //this.parentView.filterContent();
            }
        }
    });
});
define('impact-public/components/volunteer-sidebar', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
        didInsertElement: function didInsertElement() {
            this.set('component', this);
        }
    });
});
define('impact-public/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _emberWelcomePageComponentsWelcomePage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberWelcomePageComponentsWelcomePage['default'];
    }
  });
});
define('impact-public/components/x-option', ['exports', 'emberx-select/components/x-option'], function (exports, _emberxSelectComponentsXOption) {
  exports['default'] = _emberxSelectComponentsXOption['default'];
});
define('impact-public/components/x-select', ['exports', 'emberx-select/components/x-select'], function (exports, _emberxSelectComponentsXSelect) {
  exports['default'] = _emberxSelectComponentsXSelect['default'];
});
define('impact-public/components/zip-code-input', ['exports', 'ember-inputmask/components/zip-code-input'], function (exports, _emberInputmaskComponentsZipCodeInput) {
  exports['default'] = _emberInputmaskComponentsZipCodeInput['default'];
});
define('impact-public/controllers/account/change-password', ['exports', 'ember', 'impact-public/utils/api'], function (exports, _ember, _impactPublicUtilsApi) {

    var AccountChangePasswordController = _ember['default'].Controller.extend({
        errors: _ember['default'].A(),

        old_password: "",
        new_password_1: "",
        new_password_2: "",
        loading: false,

        actions: {
            changePassword: function changePassword() {
                this.set('loading', true);
                if (this.validate()) {
                    var old = this.get('old_password');
                    var new1 = this.get('new_password_1');
                    var new2 = this.get('new_password_2');
                    var self = this;

                    _impactPublicUtilsApi['default'].put("/users/password", {
                        old_password: old,
                        new_password_1: new1,
                        new_password_2: new2
                    }, function (res) {
                        if (res.error === undefined) {
                            self.growl.success('Your password was changed.');
                            self.set('old_password', '');
                            self.set('new_password_1', '');
                            self.set('new_password_2', '');
                            self.set('errors', _ember['default'].A());
                        } else {
                            self.set('errors', _ember['default'].A());
                            self.get('errors').pushObject(res.error);
                        }
                        self.set('loading', false);
                    }, true);
                } else {
                    this.set('loading', false);
                }
            }
        },

        validate: function validate() {
            var old = this.get('old_password');
            var new1 = this.get('new_password_1');
            var new2 = this.get('new_password_2');
            this.set('errors', []);

            if (!old) {
                this.get('errors').pushObject('Please enter your current password');
            }
            if (!new1) {
                this.get('errors').pushObject('Please enter a new password');
            }
            if (!new2) {
                this.get('errors').pushObject('Please confirm your new password');
            }
            if (new1 && new2 && new1 !== new2) {
                this.get('errors').pushObject('New passwords do not match');
            }

            if (this.get('errors.length') === 0) {
                return true;
            } else {
                return false;
            }
        }
    });

    exports['default'] = AccountChangePasswordController;
});
define('impact-public/controllers/account/details', ['exports', 'ember'], function (exports, _ember) {

    var AccountIndexController = _ember['default'].Controller.extend({
        application: _ember['default'].inject.controller(),
        sortProperties: ['date'],
        sortAscending: false,
        alerts: [],
        edit: false,
        actions: {
            edit: function edit() {
                this.set('edit', true);
            },
            cancel: function cancel() {
                this.get('model').revertRecord();
                this.set('edit', false);
            },
            updateAccount: function updateAccount() {
                var self = this;
                this.set('loading', true);
                this.set('alerts', []);
                if (!this.get('model.first_name')) {
                    this.get('alerts').pushObject('First name is required.');
                }
                if (!this.get('model.last_name')) {
                    this.get('alerts').pushObject('Last name is required.');
                }
                if (!this.get('model.email')) {
                    this.get('alerts').pushObject('Email is required.');
                }

                if (this.get('alerts').length === 0) {
                    var userRecord = this.get('model');
                    if (userRecord.isReallyDirty()) {
                        userRecord.saveRecord().then(function (result) {
                            if (!result.response.error) {
                                self.set('user', result.record);
                                self.get('application').set('user', result.record);
                                self.growl.success('Account Updated');
                            } else {
                                self.get('alerts').pushObject('There was a problem updating your account information. Please try again.');
                            }
                            self.set('loading', false);
                            self.set('edit', false);
                        });
                    } else {
                        this.growl.success('Account Updated');
                        this.set('edit', false);
                        this.set('loading', false);
                    }
                } else {
                    this.set('loading', false);
                }
            }
        },

        notSocialUser: (function () {
            if (this.get('user.facebook_id') || this.get('user.google_id')) {
                return false;
            }
            return true;
        }).property('user'),

        reset: function reset() {
            this.set('edit', false);
            this.set('viewingReceipt', false);
            this.set('receipt', null);
            this.set('alerts', []);
        }
    });

    exports['default'] = AccountIndexController;
});
define('impact-public/controllers/account/donations', ['exports', 'ember', 'impact-public/models/donations', 'impact-public/utils/api', 'impact-public/models/transactions', 'moment'], function (exports, _ember, _impactPublicModelsDonations, _impactPublicUtilsApi, _impactPublicModelsTransactions, _moment) {

    /* global Stripe */

    exports['default'] = _ember['default'].Controller.extend({
        application: _ember['default'].inject.controller(),
        stripe: _ember['default'].inject.service(),
        queryParams: ['offset'],
        offset: 0,
        viewingReceipt: false,
        receipt: null,
        loading: false,
        sortProps: ['date:desc'],

        canceled_recurring_donations: _ember['default'].computed.filterBy('recurringDonations', 'isCanceled', true),
        active_recurring_donations: _ember['default'].computed.filterBy('recurringDonations', 'isCanceled', false),
        sortedDonations: _ember['default'].computed.sort('donations', 'sortProps'),

        pages: _ember['default'].computed('donations.[]', function () {
            var count = parseInt(this.get('donations').objectAt(0).get('full_count'), 10);
            if (count && count > 0) {
                var pages = Math.ceil(count / 20);
                return pages;
            } else {
                return null;
            }
        }),

        cardExpiringSoon: _ember['default'].computed('cardExpMonth', 'cardExpYear', function () {
            var today = (0, _moment['default'])();
            var exp = (0, _moment['default'])(this.get('cardExpMonth') + ' ' + this.get('cardExpYear'), 'MM YYYY');

            if (exp.subtract(3, 'months').isBefore(today)) {
                return true;
            }
            return false;
        }),

        getCustomerCard: (function () {
            var _this = this;
            this.set('loadingCustomerInfo', true);
            _impactPublicUtilsApi['default'].get('/users/get-customer-info', {}, function (json) {
                if (json.error) {
                    _this.growl.error(json.error);
                    _this.set('customerInfoAvailable', false);
                } else {
                    _this.set('customerInfoAvailable', true);
                    _this.set('cardBrand', json.result.brand);
                    _this.set('cardLast4', json.result.last4);
                    _this.set('cardExpMonth', json.result.exp_month);
                    _this.set('cardExpYear', json.result.exp_year);
                    _this.set('cardZip', json.result.address_zip);
                }
                _this.set('loadingCustomerInfo', false);
            }, true);
        }).on('init'),

        checkPagination: function checkPagination() {
            var model = this.get('sortedDonations');
            if (model.get('length') > 20) {
                this.set('hasMorePages', true);
                model.removeAt(20);
            } else {
                this.set('hasMorePages', false);
            }
            if (this.get('offset') === 0) {
                this.set('hasLessPages', false);
            } else {
                this.set('hasLessPages', true);
            }
        },

        getDonations: function getDonations(offset) {
            var _this2 = this;

            _impactPublicModelsDonations['default'].find({
                user_id: this.get('application.user.id')
            }, {
                sort: {
                    date: 'desc'
                },
                limit: 21,
                offset: offset
            }).then(function (result) {
                _this2.set('donations', result);
                _this2.checkPagination();
                _this2.set('loading', false);
            });
        },

        reset: function reset() {
            this.set('viewingReceipt', false);
            this.set('receipt', null);
            this.resetCard();
        },

        resetCard: function resetCard() {
            this.set('cardName', '');
            this.set('cardNumber', '');
            this.set('expirationDate', '');
            this.set('zip', '');
            this.set('cvc', '');
        },

        actions: {
            getPrevious: function getPrevious() {
                if (this.get('hasLessPages')) {
                    this.set('loading', true);
                    var offset = this.get('offset');
                    offset -= 20;
                    var page = this.get('page');
                    page -= 1;
                    this.set('page', page);
                    this.set('offset', offset);
                    this.getDonations(offset);
                } else {
                    return;
                }
            },
            getNext: function getNext() {
                if (this.get('hasMorePages')) {
                    this.set('loading', true);
                    var offset = this.get('offset');
                    offset += 20;
                    var page = this.get('page');
                    page += 1;
                    this.set('page', page);
                    this.set('offset', offset);
                    this.getDonations(offset);
                } else {
                    return;
                }
            },
            getFirst: function getFirst() {
                if (this.get('hasLessPages') > 0) {
                    this.set('loading', true);
                    var offset = 0;
                    this.set('offset', offset);
                    this.set('page', 1);
                    this.getDonations(offset);
                }
            },
            getLast: function getLast() {
                if (this.get('hasMorePages')) {
                    this.set('loading', true);
                    var pages = this.get('pages');
                    var offset = (pages - 1) * 20;
                    this.set('offset', offset);
                    this.set('page', pages);
                    this.getDonations(offset);
                }
            },
            getReceipt: function getReceipt(transaction_id) {
                var user = this.get('application').get('user');
                var self = this;
                if (transaction_id && user.email) {
                    _impactPublicUtilsApi['default'].get('/donations/' + transaction_id + '/receipt', {
                        transaction_id: transaction_id,
                        user: user
                    }, function () {
                        self.growl.success('Email receipt has been sent.');
                    }, true);
                }
            },
            viewReceipt: function viewReceipt(id) {
                var _this3 = this;

                var user = this.get('application').get('user');
                if (id && user.email) {
                    var donations = this.get('donations').filterBy('transaction_id', id);
                    //get the transaction
                    this.set('loadingReceipt', true);
                    this.set('viewingReceipt', true);

                    var getTransaction = _impactPublicModelsTransactions['default'].find(id);
                    getTransaction.then(function (json) {
                        _this3.set('transaction', json);
                        _this3.set('receipt', donations);
                        _this3.set('loadingReceipt', false);
                    })['catch'](function (json) {
                        _this3.growl.error('Your receipt could not be retrieved at this time. Please try again.');
                        console.log(json);
                        _this3.set('loadingReceipt', false);
                        _this3.set('viewingReceipt', false);
                    });
                }
            },
            seeAll: function seeAll() {
                this.set('viewingReceipt', false);
            },
            printReceipt: function printReceipt() {
                window.print();
            },
            cancelRecurring: function cancelRecurring(recurring_donation) {
                var _this = this;
                this.set('loading', true);
                _impactPublicUtilsApi['default'].post('/recurring_donations/cancel', {
                    recurring_id: recurring_donation.get('id'),
                    subscription_id: recurring_donation.get('subscription_id')
                }, function (json) {
                    if (json.error) {
                        _this.growl.error(json.error);
                    } else {
                        _this.growl.success('Your recurring donation has been canceled.');
                        recurring_donation.set('status', 'canceled');
                    }
                    _this.set('loading', false);
                }, true);
            },
            showUpdateCard: function showUpdateCard() {
                this.set('updatingCard', true);
            },
            cancelUpdateCard: function cancelUpdateCard() {
                this.set('updatingCard', false);
                this.resetCard();
            },
            updateCard: function updateCard() {
                var _this4 = this;

                var _this = this;
                this.set('loading', true);

                //Sometimes card js doesn't put the date in the right format if form is auto filled
                var onlyNumbersExpDate = this.get('expirationDate').replace(/\D/g, '');
                this.set('expirationDate', onlyNumbersExpDate);
                var card = {
                    name: this.get('cardName'),
                    address_zip: this.get('zip'),
                    number: this.get('cardNumber'),
                    exp_month: this.get('expirationDate').substring(0, 2),
                    exp_year: this.get('expirationDate').slice(2),
                    cvc: this.get('cvc')
                };

                if (typeof Stripe === 'undefined') {
                    this.growl.error('Credit card processing momentarily down. Please try again in a bit.');
                    this.set('loading', true);

                    return;
                } else {
                    //generate a Stripe token for this card
                    var stripe = this.get('stripe');
                    //Create Stripe Token
                    stripe.card.createToken(card).then(function (response) {
                        // response contains id and card, we only need the id
                        var token = response.id;
                        _impactPublicUtilsApi['default'].put('/users/update-card', {
                            stripe_token: token
                        }, function (json) {
                            if (json.error) {
                                _this.growl.error('An error occurred while updating your card. Please try again.');
                                console.log(json.error);
                            } else {
                                _this.growl.success('Card was updated!');
                                _this.getCustomerCard();
                                _this.set('updatingCard', false);
                            }
                            _this.set('loading', false);
                        }, true);
                    })['catch'](function (reason) {
                        _this4.set('loading', false);
                        _this4.growl.error('An error occurred trying to update your card. Please try again.');
                        console.log(reason);
                    });
                }
            }
        }
    });
});
define('impact-public/controllers/application', ['exports', 'ember', 'impact-public/utils/token', 'moment', 'impact-public/models/donations-local'], function (exports, _ember, _impactPublicUtilsToken, _moment, _impactPublicModelsDonationsLocal) {

    /*
     * Main Application Frame
     */
    var ApplicationController = _ember['default'].Controller.extend({
        payProcessingCharges: false,
        user: null,
        token: null,
        savedTransition: null,

        /**
         * This allows for binding to the token and donations event change in case the token is set outside the application
         */
        setupLocalStorageEvents: (function () {
            _ember['default'].$.jStorage.listenKeyChange('donations', _ember['default'].run.bind(this, this.handle_storage));
            _ember['default'].$.jStorage.listenKeyChange('token', _ember['default'].run.bind(this, this.tokenHasChanged));
        }).on('init'),

        sortedDonations: (function () {
            if (this.get('donations')) {
                return this.get('donations').sortBy('id');
            } else {
                return [];
            }
        }).property('donations.[]'),

        isGHD: (function () {
            if (this.get('isGivingHeartsDay')) {
                if ((0, _moment['default'])().unix() < this.get('startGivingHeartsDay')) {
                    return false;
                }
                if ((0, _moment['default'])().unix() > this.get('endGivingHeartsDay')) {
                    return false;
                }
                return true;
            } else {
                return false;
            }
        }).property('isGivingHeartsDay', 'startGivingHeartsDay', 'endGivingHeartsDay'),

        reset: function reset() {
            //set('user', false);
            this.set('user', null);
            _impactPublicUtilsToken['default'].set(false);
            _ember['default'].$.jStorage.set('user', null);
            _ember['default'].$.jStorage.set('token', null);
        },

        handle_storage: function handle_storage(key) {
            if (key === 'donations') {
                //update the values for the application

                var jStorageDonations = _ember['default'].$.jStorage.get('donations');
                if (jStorageDonations && jStorageDonations.length > 0) {
                    var donations = _ember['default'].A([]);

                    _.each(jStorageDonations, function (donation) {
                        var object = _impactPublicModelsDonationsLocal['default'].create(donation);
                        donations.pushObject(object);
                    });
                    donations = donations.sortBy('id');
                    this.set('donations', donations);
                } else {
                    this.set('donations', []);
                }
            }
        },

        tokenHasChanged: function tokenHasChanged(key) {
            if (key === 'token') {
                var token = _ember['default'].$.jStorage.get('token');
                var user = _ember['default'].$.jStorage.get('user');

                if (token && user) {
                    this.set('user', user);
                    this.set('token', token);
                    this.set('guest', false);
                    _ember['default'].$.jStorage.deleteKey('guest');

                    //If we are sitting on the signin page and this changes, retry the last transition
                    if (this.get('currentPath') === 'signin') {
                        if (this.get('savedTransition')) {
                            this.get('savedTransition').retry();
                        }
                    }
                } else {
                    this.set('user', null);
                    this.set('token', null);
                }
            }
        }
    });

    exports['default'] = ApplicationController;
});
/* global _ */
define('impact-public/controllers/charity-list', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        application: _ember['default'].inject.controller(),

        formattedWebsite: _ember['default'].computed('model.website', function () {
            if (this.get('model.website').indexOf('http://') > -1) {
                return this.get('model.website');
            } else {
                return 'http://' + this.get('model.website');
            }
        })
    });
});
define('impact-public/controllers/charity', ['exports', 'ember', 'numeral', 'impact-public/models/donations-local'], function (exports, _ember, _numeral, _impactPublicModelsDonationsLocal) {
    exports['default'] = _ember['default'].Controller.extend({
        application: _ember['default'].inject.controller(),
        showDonation: true,
        sortedComments: _ember['default'].computed.sort('comments', 'sortDefinition'),
        sortDefinition: ['date'],
        formattedWebsite: _ember['default'].computed('model.website', function () {
            if (this.get('model.website').indexOf('http://') > -1) {
                return this.get('model.website');
            } else {
                return 'http://' + this.get('model.website');
            }
        }),

        hasDonations: _ember['default'].computed('application.donations.[]', function () {
            return this.get('application.donations').length > 0;
        }),

        actions: {
            toggleShowDonation: function toggleShowDonation() {
                this.toggleProperty('showDonation');
            },
            addToCart: function addToCart(amount, convertFromCents) {
                amount = String(amount);
                if (!amount) {
                    this.growl.error('Please enter an amount');
                    return;
                }

                if (amount.match(/^$/)) {
                    amount = amount.substring(1, amount.length - 1);
                }
                if (amount.match(/[^$,.\d]/)) {
                    this.growl.error('Please enter an valid dollar amount');
                    return;
                }

                try {
                    amount = parseFloat(amount).toFixed(2);
                } catch (err) {
                    this.growl.error('Please enter an valid dollar amount');
                    return;
                }

                if (amount < 10) {
                    this.growl.error('Amount must be at least $10');
                    return;
                }
                //convert amount to cents
                if (convertFromCents) {
                    amount = amount / 100;
                    amount = amount.toFixed(2);
                }
                var donation = _impactPublicModelsDonationsLocal['default'].create({
                    nonprofit_id: this.get('model.id'),
                    nonprofit_name: this.get('model.name'),
                    amount: amount,
                    dedicate: false,
                    dedicationSelected: '',
                    dedicationName: '',
                    processingCharge: null,
                    payProcessingCharges: null
                });
                if (this.get('makeRecurring')) {
                    donation.set('recurring', true);
                    donation.set('recurringInterval', this.get('recurringInterval'));
                }
                var donations = this.get('application.donations');

                if (donations.length < 25) {
                    var newDonation = donation.save();
                    if (newDonation !== 'lendAHandException') {
                        donations.pushObject(donation);
                        this.reset();
                        this.growl.success('Donation added to your cart');
                    }
                } else {
                    var options = {
                        closeIn: 15000
                    };
                    this.growl.warning('There is a limit of 25 donations ' + 'per cart. Please add more donations in a different transaction.', options);
                }
            },
            saveDonationCampaign: function saveDonationCampaign(campaign_id, amount, campaign_title) {
                var donations = this.get('application.donations');

                if (!amount) {
                    this.growl.error('Please enter an amount.');
                } else {
                    if (donations.length < 25) {

                        var donation = _impactPublicModelsDonationsLocal['default'].create({
                            nonprofit_id: this.get('model.id'),
                            nonprofit_name: this.get('model.name'),
                            amount: (0, _numeral['default'])(amount).format('0,0.00'),
                            dedicate: false,
                            dedicationSelected: '',
                            dedicationName: '',
                            processingCharge: null,
                            payProcessingCharges: null,
                            campaign_id: campaign_id,
                            campaign_title: campaign_title
                        });

                        var newDonation = donation.save();
                        if (newDonation !== 'lendAHandException') {
                            donations.pushObject(donation);
                            this.growl.success('Donation added to your cart');
                        }
                    } else {
                        var options = {
                            closeIn: 15000
                        };
                        this.growl.warning('There is a limit of 25 donations ' + 'per cart. Please add more donations in a different transaction.', options);
                    }
                }
            },

            setRecurringInterval: function setRecurringInterval(value) {
                this.set('recurringInterval', value);
            }
        },

        volunteerOpportunitiesLength: _ember['default'].computed('volunteerOpportunities.[]', function () {
            return this.get('volunteerOpportunities.length');
        }),

        reset: function reset() {
            this.set('amount', '');
            this.set('makeRecurring', false);
            this.set('recurringInterval', 'monthly');
        }
    });
});
define('impact-public/controllers/checkout', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        ghd: _ember['default'].inject.service('manage-ghd')
    });
});
define('impact-public/controllers/checkout/index', ['exports', 'ember', 'numeral', 'impact-public/models/donations-local'], function (exports, _ember, _numeral, _impactPublicModelsDonationsLocal) {

    var CheckoutController = _ember['default'].Controller.extend({
        ghd: _ember['default'].inject.service('manage-ghd'),
        application: _ember['default'].inject.controller(),
        home: _ember['default'].inject.controller(),
        analytics: _ember['default'].inject.service(),
        wasVisited: false,
        payProcessingCharges: false,
        alerts: [],
        processing_percentage: 0.029,
        transaction_charge: 0.30,
        explanation: false,
        showCartWithCharges: false,
        sortProperties: ['id'],
        sortAscending: true,

        setRecurringOptions: (function () {
            var cart = _ember['default'].$.jStorage.get('cart');
            if (this.get('onlyOneDonationInCart') && cart && cart.recurring && cart.recurringInterval) {
                this.set('recurring', cart.recurring);
                this.set('recurringInterval', cart.recurringInterval);
            } else {
                this.set('recurring', false);
                this.set('recurringInterval', null);
            }
        }).on('init'),

        model: _ember['default'].computed.alias('application.donations'),

        onlyOneDonationInCart: _ember['default'].computed('model.[]', function () {
            var count = this.get('model.length');
            if (count === 1) {
                return true;
            } else {
                return false;
            }
        }),

        actions: {
            removeDonation: function removeDonation(donation) {
                if (confirm('Are you sure you want to remove this donation?')) {
                    this.get('analytics').track({
                        category: 'donation',
                        action: 'remove',
                        label: donation.nonprofit_name
                    });
                    var donationToRemove = this.get('application.donations').findBy('id', donation.get('id'));
                    this.get('application.donations').removeObject(donationToRemove);

                    //Need to also remove from local storage
                    if (donation.remove !== undefined) {
                        donation.remove();
                    } else {
                        var localDonation = _impactPublicModelsDonationsLocal['default'].create(donation);
                        localDonation.remove();
                    }

                    //Reset the donationAdded property of the nonprofit on the home route
                    if (this.get('home.model')) {
                        this.get('home.model').findBy('id', donation.nonprofit_id).set('donationAdded', false);
                    }
                }
            },
            keepGoing: function keepGoing() {
                this.updateCart();
                this.set('alerts', []);
                var dedications = this.get('model').filterBy('dedicate', true);
                var self = this;
                if (dedications.length > 0) {
                    _.each(dedications, function (value) {
                        if (!value.dedicationName) {
                            self.get('alerts').pushObject('Please enter a name for dedication (' + value.nonprofit_name + ')');
                        }
                    });
                    if (this.get('alerts').length > 0) {
                        return;
                    } else {
                        this.get('analytics').track({
                            category: 'cart',
                            action: 'checkout',
                            label: 'continue'
                        });
                        this.transitionToRoute('checkout.review');
                    }
                } else if ((0, _numeral['default'])().unformat(this.get('cartTotal')) <= 0.5) {
                    this.get('alerts').pushObject('Donations total must be greater than $0.50');
                } else {
                    this.get('analytics').track({
                        category: 'cart',
                        action: 'review',
                        label: 'continue'
                    });
                    this.transitionToRoute('checkout.review');
                }
            },
            toggleExplanation: function toggleExplanation() {
                this.toggleProperty('explanation');
            },
            setRecurring: function setRecurring(value) {
                this.set('recurring', value);
                if (value) {
                    this.set('recurringInterval', 'monthly');
                } else {
                    this.set('recurringInterval', null);
                }
                this.updateCart();
            },
            saveInterval: function saveInterval(interval) {
                this.set('recurringInterval', interval);
                this.updateCart();
            }
        },

        reset: function reset() {
            this.set('wasVisited', false);
            this.set('alerts', []);
        },

        //Computed Props
        showCartTotal: (function () {
            if (this.get('cartTotal') === '0.00') {
                return false;
            }
            return true;
        }).property('cartTotal'),

        cartTotal: (function () {
            var donations = this.get('model');
            if (donations) {
                if (donations.length > 0) {
                    var amounts = _.pluck(donations, 'amount');
                    var total = 0;
                    _.each(amounts, function (element) {
                        if (element) {
                            element = parseFloat((0, _numeral['default'])().unformat(element));
                            total += element;
                        }
                    });
                    return total.toFixed(2);
                }
            }
            return '0.00';
        }).property('model.@each.amount'),

        processingCharges: (function () {
            if (this.get('payProcessingCharges')) {
                //Add 2.9% and $0.3 for the cart
                var processing_percentage = this.get('processing_percentage');
                var transaction_charge = this.get('transaction_charge');

                var cartSubTotal = this.get('cartTotal');
                var cartTotal = cartSubTotal * processing_percentage;
                cartTotal = cartTotal + transaction_charge;
                //convert to cents and round
                cartTotal = Math.round(cartTotal * 100);

                return (0, _numeral['default'])(cartTotal / 100).format('0,0.00');
            }
            return 0;
        }).property('payProcessingCharges', 'cartTotal'),

        cartTotalWithCharges: (function () {
            return (parseFloat(this.get('cartTotal')) + parseFloat(this.get('processingCharges'))).toFixed(2);
        }).property('cartTotal', 'processingCharges'),

        //Observers
        showProcessingCharges: (function () {
            this.toggleProperty('showCartWithCharges');
        }).observes('payProcessingCharges'),

        updateCart: (function () {
            var interval = null;
            if (this.get('model.length') > 1) {
                this.set('recurring', false);
                this.set('recurringInterval', null);
            }
            if (this.get('recurring')) {
                interval = this.get('recurringInterval');
            }
            _ember['default'].$.jStorage.set('cart', {
                payProcessingCharges: this.get('payProcessingCharges'),
                processingCharges: this.get('processingCharges'),
                totalWithCharges: this.get('cartTotalWithCharges'),
                recurring: this.get('recurring'),
                recurringInterval: interval
            });
        }).observes('payProcessingCharges', 'cartTotalWithCharges', 'model.[]')
    });

    exports['default'] = CheckoutController;
});
/* global _ */
define('impact-public/controllers/checkout/review', ['exports', 'ember', 'impact-public/models/stripe-fail-log', 'numeral', 'impact-public/utils/api', 'impact-public/config/environment', 'impact-public/utils/token'], function (exports, _ember, _impactPublicModelsStripeFailLog, _numeral, _impactPublicUtilsApi, _impactPublicConfigEnvironment, _impactPublicUtilsToken) {
    /* global $ */
    /* global Stripe */

    var CheckoutReviewController = _ember['default'].Controller.extend({
        stripe: _ember['default'].inject.service(),
        fb: _ember['default'].inject.service(),
        application: _ember['default'].inject.controller(),
        home: _ember['default'].inject.controller(),
        checkout: _ember['default'].inject.controller(),
        analytics: _ember['default'].inject.service(),
        key: '',
        showEcard: false,
        emailSent: false,
        showShareOptions: false,
        cart: undefined,
        alerts: [],
        errors: [],
        loading: false,
        isProcessingPayment: false,
        emailDonations: [],
        donationsSucceeded: null,
        viewReceipt: false,
        manageGHD: _ember['default'].inject.service('manage-ghd'),
        anonymousDonation: false,
        addSecondFirstName: false,
        addBusinessMatching: false,
        model: _ember['default'].computed.alias('application.sortedDonations'),

        /* Activate this in the setupController of the route to test receipt */
        //testReceipt: function() {
        //    var donor = {
        //        id: this.get('application.user.id'),
        //        first_name: this.get('application.user.first_name'),
        //        last_name: this.get('application.user.last_name'),
        //        email: this.get('application.user.email'),
        //        phone: this.get('application.user.phone'),
        //        billing_address: this.get('application.user.billing_address'),
        //        billing_address2: this.get('application.user.billing_address2'),
        //        billing_city: this.get('application.user.billing_city'),
        //        billing_state: this.get('application.user.billing_state'),
        //        billing_postal_code: this.get('application.user.billing_postal_code'),
        //        stripe_customer: this.get('application.user.stripe_customer'),
        //        anonymous: this.get('anonymousDonation'),
        //        business: this.get('business')
        //    };
        //    this.set('showShareOptions', true);
        //    this.set('donor', donor);
        //    this.set('receiptDonations', this.get('model'));
        //    this.set('transaction_id', 1355);
        //    var transaction = {
        //        charge_amount: this.get('cart.totalWithCharges'),
        //        processing_charge: this.get('cart.processingCharges'),
        //        date: "2015-11-3 15:40:17.223494",
        //        id: this.get('transaction_id')
        //    };
        //    this.set('cart', transaction);
        //},

        actions: {
            toggleBusinessMatching: function toggleBusinessMatching() {
                this.set('addBusinessMatching', !this.addBusinessMatching);
            },
            toggleSecondFirstName: function toggleSecondFirstName() {
                this.set('addSecondFirstName', !this.addSecondFirstName);
            },
            makePayment: function makePayment() {

                if (this.get('willmatch') && !this.get('business')) {
                    this.growl.error('Please enter a business name for your employee match.');
                    return;
                }

                if (this.get('isgift') && !this.get('business')) {
                    this.growl.error('Please enter a business name for your business gift.');
                    return;
                }

                var self = this;
                this.set('viewReceipt', false);
                this.setProperties({
                    loading: true,
                    alerts: [],
                    errors: [],
                    donationsSucceeded: false
                });

                if (typeof Stripe === 'undefined') {
                    this.logStripeFailure('Credit card processing momentarily down. Please try again in a bit.', 'Stripe.js failed to load on the page');
                } else {
                    if (this.validateCard()) {
                        var isGuest = this.get('guest'),
                            stripe = this.get('stripe'),
                            obj = {};

                        this.set('isProcessingPayment', true);

                        if (isGuest) {
                            obj = {
                                email: this.get('guestEmail'),
                                id: isGuest ? null : this.get('application.user.id')
                            };
                        }

                        var donor = this.normalize_donor(obj);
                        self.set('donor', donor);

                        stripe.card.createToken(this.card()).then(function (response) {
                            var token = response.id,
                                donations = [],
                                cart = _ember['default'].$.jStorage.get('cart');

                            //Double check cart object is there
                            if (!cart) {
                                self.get('errors').pushObject('Something went wrong and your cart cannot be processed at this time. Please ' + 'contact us to resolve this issue.');

                                self.setProperties({
                                    showShareOptions: false,
                                    isProcessingPayment: false,
                                    loading: false
                                });

                                return;
                            }

                            //If a guest...do not do recurring
                            if (self.get('guest')) {
                                cart.recurring = false;
                                cart.recurringInterval = null;
                            }

                            self.setProperties({
                                cart: cart,
                                isProcessingPayment: true
                            });

                            self.get('model').forEach(function (item) {
                                donations.push({
                                    amount: (0, _numeral['default'])().unformat(item.amount),
                                    dedicate: item.dedicate,
                                    dedicationName: item.dedicationName,
                                    dedicationSelected: item.dedicationSelected,
                                    designation: item.designation,
                                    id: item.id,
                                    nonprofit_id: item.nonprofit_id,
                                    nonprofit_name: item.nonprofit_name,
                                    payProcessingCharges: item.payProcessingCharges,
                                    processingCharge: (0, _numeral['default'])().unformat(item.processingCharge),
                                    recurring: item.recurring || null,
                                    recurringInterval: item.recurringInterval || null,
                                    campaign_id: item.campaign_id,
                                    business: self.get('business'),
                                    will_be_matched: self.get('willmatch'),
                                    is_a_gift: self.get('isgift'),
                                    new_ghd_donor: self.get('newghddonor'),
                                    campaign_code: self.get('couponcode') ? self.get('couponcode') : null,
                                    comment: item.comment,
                                    hide_comment_author: item.hide_comment_author,
                                    hide_comment_donation_amount: item.hide_comment_donation_amount
                                });
                            });

                            _impactPublicUtilsApi['default'].post('/giving/donate', {
                                donations: donations,
                                stripeToken: token,
                                donor: donor,
                                cart: cart
                            }, function (json) {
                                self.set('errors', []);

                                if (json.error || json.errors || !json.charge_succeeded) {
                                    self.setProperties({
                                        showShareOptions: false,
                                        isProcessingPayment: false,
                                        loading: false
                                    });

                                    if (json.errors) {
                                        if (_.isArray(json.errors)) {
                                            _.each(json.errors, function (error) {
                                                self.get('errors').pushObject(error);
                                            });
                                        } else {
                                            self.get('errors').pushObject(json.errors);
                                        }
                                    }

                                    if (json.error) {
                                        self.get('errors').pushObject(json.error);
                                    }

                                    if (!json.error && !json.errors && !json.charge_succeeded) {
                                        self.get('errors').pushObject('Your card was not charged successfully.');
                                    }
                                } else {
                                    self.setProperties({
                                        showShareOptions: true,
                                        isProcessingPayment: false,
                                        loading: false
                                    });

                                    self.set('transaction_id', json.transaction_id);

                                    var modelDonations = [];
                                    self.get('model').forEach(function iterator(donation) {
                                        modelDonations.push(donation);
                                    });

                                    self.set('receiptDonations', modelDonations);

                                    //Flush the donations and cart
                                    _ember['default'].$.jStorage.deleteKey('donations');
                                    _ember['default'].$.jStorage.deleteKey('cart');

                                    self.get('application').setProperties({
                                        donations: _ember['default'].A(),
                                        payProcessingCharges: false,
                                        guest: false
                                    });

                                    var homeModelContent = self.get('home');

                                    if (homeModelContent && homeModelContent.get('model.content')) {
                                        homeModelContent = homeModelContent.get('model.content');
                                        homeModelContent.setEach('donationAdded', false);
                                        homeModelContent.setEach('isDonating', false);
                                    }

                                    self.get('checkout').set('payProcessingCharges', false);

                                    self.set('donationsSucceeded', true);

                                    self.get('analytics').track({
                                        category: 'transaction',
                                        action: 'successful'
                                    });
                                }
                            });
                        })['catch'](function (reason) {

                            self.logStripeFailure(reason.error.message, 'Stripe.js failed to create a card token');
                        });
                    } else {
                        self.setProperties({
                            showShareOptions: false,
                            isProcessingPayment: false,
                            loading: false
                        });
                    }
                }
            },

            toggleEcard: function toggleEcard() {
                this.toggleProperty('showEcard');
            },

            cancel: function cancel() {
                if (confirm('Would you like to discard your changes?')) {
                    this.setProperties({
                        showEmail: false,
                        message: '',
                        email: ''
                    });

                    _.each(this.get('receiptDonations'), function (donation) {
                        donation.includeDonation = false;
                    });
                }
            },

            facebookShare: function facebookShare() {
                this.get('fb').ui({
                    method: 'share',
                    href: _impactPublicConfigEnvironment['default'].share_url
                }, function () {});

                this.get('analytics').track({
                    category: 'share',
                    action: 'facebook'
                });
            },

            toggleViewReceipt: function toggleViewReceipt() {
                if (!this.get('viewReceipt')) {
                    var transaction_id = this.get('transaction_id');
                    if (transaction_id) {
                        var self = this;
                        this.set('loadingReceipt', true);
                        _impactPublicUtilsApi['default'].get('/giving/receipt/transaction/' + transaction_id, {
                            _token: _impactPublicUtilsToken['default'].get()
                        }, function (json) {
                            if (json.error) {
                                self.growl.error('Your receipt is currently unavailable. Please contact us for more information.');
                            } else {
                                self.setProperties({
                                    transaction: json.result.transaction,
                                    transaction_donations: json.result.donations
                                });
                                self.set('viewReceipt', true);
                            }
                            self.set('loadingReceipt', false);
                        }, false);
                    } else {
                        //Show error message
                        this.growl.error('Your receipt is currently unavailable. Please contact us for more information.');
                    }
                } else {
                    this.set('viewReceipt', false);
                }
            }
        },

        scrollToTop: (function () {
            if (this.get('alerts').length > 0 || this.get('errors').length > 0 || this.get('isProcessingPayment')) {
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }
        }).observes('alerts.[]', 'errors.[]', 'isProcessingPayment'),

        setUserName: (function () {
            var isGuest = this.get('guest');

            //Automatically set first and last name if the user is logged in
            this.setProperties({
                firstName: isGuest ? '' : this.get('application.user.first_name'),
                secondFirstName: isGuest ? '' : this.get('application.user.second_first_name'),
                lastName: isGuest ? '' : this.get('application.user.last_name')
            });
        }).observes('application.user'),

        logStripeFailure: function logStripeFailure(error, stripe_fail_type) {
            this.get('errors').pushObject(error);

            var errorEmail = this.get('guest') ? this.get('guestEmail') : this.get('application.user.email');
            var donations = [];

            this.get('model').forEach(function (item) {
                donations.push({
                    amount: (0, _numeral['default'])().unformat(item.amount),
                    dedicate: item.dedicate,
                    dedicationName: item.dedicationName,
                    dedicationSelected: item.dedicationSelected,
                    designation: item.designation,
                    id: item.id,
                    nonprofit_id: item.nonprofit_id,
                    nonprofit_name: item.nonprofit_name,
                    payProcessingCharges: item.payProcessingCharges,
                    processingCharge: (0, _numeral['default'])().unformat(item.processingCharge)
                });
            });

            var stripe_log = _impactPublicModelsStripeFailLog['default'].createRecord();

            stripe_log.setProperties({
                stripe_fail_type: stripe_fail_type,
                customer_id: this.get('application.user.id'),
                first_name: this.get('firstName'),
                last_name: this.get('lastName'),
                phone: this.get('phone'),
                email: errorEmail,
                donations: JSON.stringify(donations)
            }).saveRecord();

            this.setProperties({
                loading: false,
                isProcessingPayment: false
            });
        },

        validateCard: function validateCard() {
            var isGuest = this.get('guest'),
                alerts = this.get('alerts');

            //Sometimes card js doesn't put it in the right format if form is auto filled
            this.set('expirationDate', this.get('expirationDate').replace(/\D/g, ''));

            if (isGuest && !this.get('guestEmail')) {
                alerts.pushObject('Please enter an email address');
            }

            if (!this.get('anonymousDonation') && !this.get('phone')) {
                alerts.pushObject('Please enter a phone number.');
            }

            if (!this.get('cardName')) {
                alerts.pushObject('Please enter the name on your card.');
            }

            if (!this.get('cardNumber')) {
                alerts.pushObject('Please enter the card number.');
            } else if (Stripe.card.validateCardNumber(this.get('cardNumber')) === false) {
                alerts.pushObject('Please enter a valid card number.');
            } else if (Stripe.card.cardType(this.get('cardNumber')) === 'American Express') {
                alerts.pushObject('Because of the higher transaction rates, we do not take American Express cards. Please use a different card.');
            }

            if (!this.get('expirationDate')) {
                alerts.pushObject('Please enter the expiration date.');
            } else if (Stripe.validateExpiry(this.get('expirationDate').substring(0, 2), this.get('expirationDate').slice(2)) === false) {
                alerts.pushObject('Please enter a valid expiration date.');
            }

            if (!this.get('cvc')) {
                alerts.pushObject('Please enter the CVC');
            }

            var usRegex = /^\d{5}$/;
            var caRegex = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/;
            if (!this.get('zip') || !this.get('zip').match(usRegex) && !this.get('zip').toUpperCase().match(caRegex)) {
                alerts.pushObject('Invalid postal code');
            }

            return alerts.length === 0;
        },

        normalize_donor: function normalize_donor(obj) {
            return _.extend({}, {
                id: null,
                first_name: this.get('firstName'),
                second_first_name: this.get('secondFirstName'),
                last_name: this.get('lastName'),
                email: this.get('application.user.email'),
                phone: this.get('phone'),
                billing_address: this.get('address1'),
                billing_address2: this.get('address2'),
                billing_city: this.get('city'),
                billing_state: this.get('state'),
                billing_postal_code: this.get('zip'),
                stripe_customer: this.get('application.user.stripe_customer'),
                anonymous: this.get('anonymousDonation'),
                business: this.get('business'),
                ghd_email_opt_in: this.get('ghd_email_opt_in')
            }, obj);
        },

        card: function card() {
            return {
                name: this.get('cardName'),
                address_line1: this.get('address1'),
                address_line2: this.get('address2'),
                address_city: this.get('city'),
                address_state: this.get('state'),
                address_zip: this.get('zip'),
                number: this.get('cardNumber'),
                exp_month: this.get('expirationDate').substring(0, 2),
                exp_year: this.get('expirationDate').slice(2),
                cvc: this.get('cvc')
            };
        },

        reset: function reset() {
            var isGuest = this.get('guest');

            if (this.get('application.user.second_first_name')) {
                this.set('addSecondFirstName', true);
            }

            this.setProperties({
                alerts: [],
                errors: [],
                loading: false,
                isProcessingPayment: false,
                cardName: '',
                cardNumber: '',
                expirationDate: '',
                cvc: '',
                email: '',
                guestEmail: '',
                showEcard: false,
                emailSent: false,
                showShareOptions: false,
                anonymousDonation: false,
                willmatch: false,
                isgift: false,
                ghd_email_opt_in: false,
                couponcode: '',
                donationsThatSucceeded: [],
                firstName: isGuest ? '' : this.get('application.user.first_name'),
                secondFirstName: isGuest ? '' : this.get('application.user.second_first_name'),
                lastName: isGuest ? '' : this.get('application.user.last_name'),
                phone: isGuest ? '' : this.get('application.user.phone'),
                address1: isGuest ? '' : this.get('application.user.billing_address'),
                address2: isGuest ? '' : this.get('application.user.billing_address2'),
                city: isGuest ? '' : this.get('application.user.billing_city'),
                state: isGuest ? '' : this.get('application.user.billing_state'),
                zip: isGuest ? '' : this.get('application.user.billing_postal_code'),
                business: isGuest ? '' : this.get('application.user.business'),
                donationsSucceeded: null,
                transaction_id: null
            });
        }
    });

    exports['default'] = CheckoutReviewController;
});
/* global _ */
define('impact-public/controllers/contact', ['exports', 'ember', 'impact-public/utils/api'], function (exports, _ember, _impactPublicUtilsApi) {

    var ContactController = _ember['default'].Controller.extend({
        ghd: _ember['default'].inject.service('manage-ghd'),
        full_name: '',
        email: '',
        phone_number: '',
        organization: '',
        question_comment: '',
        errors: _ember['default'].A(),
        success: null,

        actions: {
            send: function send() {
                var self = this;
                _impactPublicUtilsApi['default'].post('/giving/contact', {
                    full_name: this.get('full_name'),
                    email: this.get('email'),
                    phone_number: this.get('phone_number'),
                    organization: this.get('organization'),
                    question_comment: this.get('question_comment')
                }, function (response) {
                    if (response.error !== undefined) {
                        self.set('success', null);
                        self.set('errors', _ember['default'].A());
                        self.get('errors').pushObject(response.error);
                    } else {
                        self.set('success', response.result);
                        self.set('full_name', '');
                        self.set('email', '');
                        self.set('phone_number', '');
                        self.set('organization', '');
                        self.set('question_comment', '');
                    }
                });
            }
        },

        reset: function reset() {
            this.set('full_name', '');
            this.set('email', '');
            this.set('phone_number', '');
            this.set('organization', '');
            this.set('question_comment', '');
            this.set('success', null);
        }
    });

    exports['default'] = ContactController;
});
define('impact-public/controllers/countdown', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({
    application: _ember['default'].inject.controller(),

    actions: {
      transitionToHome: function transitionToHome() {
        var _this = this;
        setTimeout(function () {
          _this.set('application.isGivingHeartsDay', true);
          _this.set('application.isGHD', true);
          _this.transitionToRoute('home');
        }, 1000);
      }
    }
  });
});
define('impact-public/controllers/home-lah', ['exports', 'ember', 'impact-public/utils/api'], function (exports, _ember, _impactPublicUtilsApi) {
  exports['default'] = _ember['default'].Controller.extend({
    application: _ember['default'].inject.controller(),
    queryParams: ['nameFilterText'],
    showCartTotal: _ember['default'].computed.alias('application.donations.length'),
    nameFilterText: null,
    organizationSortProperties: ['serve_area', 'name:asc'],
    sortedCharities: _ember['default'].computed.sort('filteredCharities', 'organizationSortProperties'),
    noResults: _ember['default'].computed('sortedCharities', function () {
      return !this.get('sortedCharities').length;
    }),
    milesOptions: _ember['default'].A([{
      value: 5,
      label: '5 miles'
    }, {
      value: 10,
      label: '10 miles'
    }, {
      value: 15,
      label: '15 miles'
    }, {
      value: 20,
      label: '20 miles'
    }, {
      value: 50,
      label: '50 miles'
    }]),
    miles: 5,
    actions: {
      filterResults: function filterResults() {
        var _this = this;

        var locationFilter = this.get('locationFilter');
        if (locationFilter) {
          this.set('nameFilterText', '');
        }
        var nameFilter = this.get('nameFilterText');
        var filteredResults = this.get('allOrganizations').filter(function (org) {
          return _this.filterByName(org, nameFilter);
        }).filter(function (org) {
          return _this.filterByZip(org, locationFilter);
        });

        this.set('filteredCharities', filteredResults);
      },
      resetNameFilter: function resetNameFilter() {
        this.set('nameFilterText', '');
        this.send('filterResults');
      },
      resetZip: function resetZip() {
        this.set('zip', '');
      },
      postCodeSearch: function postCodeSearch() {
        var _this2 = this;

        var _getProperties = this.getProperties('zip', 'miles');

        var zip = _getProperties.zip;
        var miles = _getProperties.miles;

        if (!zip) {
          this.growl.error('Please enter a zip code');
        } else if (!miles) {
          this.growl.error('Please enter the miles radius');
        } else {
          this.set('searching', true);
          _impactPublicUtilsApi['default'].post('/location-search/charity', {
            postal_code: zip,
            miles: miles
          }, function (json) {
            if (json.error) {
              _this2.set('searching', false);
              _this2.growl.error(json.error);
            } else {
              _this2.set('locationFilter', json);
              _this2.send('filterResults');
            }
          });
        }
      },
      clearFilters: function clearFilters() {
        this.set('zip', '');
        this.set('nameFilterText', '');
        this.set('locationFilter', null);
        this.set('hasFilters', false);
        this.send('filterResults');
      },
      resendReceipts: function resendReceipts(email) {
        if (email) {
          _impactPublicUtilsApi['default'].post('/giving/resendreceipts', {
            email: email
          }, function (json) {
            if (json.error) {
              alert(json.error);
            } else {
              alert("All of your donations receipts have been re-emailed to you!");
            }
          });
        }
        this.set('email', null);
      }
    },
    filterByName: function filterByName(org, nameFilterText) {
      if (!nameFilterText) {
        return true;
      }
      this.set('hasFilters', true);
      var sanitizedNameFilter = nameFilterText.replace(/[^\w\s]/gi, '').toUpperCase();
      var sanitizedOrgName = org.get('name').replace(/[^\w\s]/gi, '').toUpperCase();

      return sanitizedOrgName.indexOf(sanitizedNameFilter) > -1 || org.get('keywords').includes(sanitizedNameFilter.toUpperCase());
    },
    filterByZip: function filterByZip(org, locationFilter) {
      if (!locationFilter) {
        return true;
      }

      this.set('hasFilters', true);
      var orgID = org.get('id');
      if (locationFilter.city && locationFilter.city.length && locationFilter.city.includes(orgID)) {
        org.set('serve_area', 0);
        return true;
      } else if (locationFilter.county && locationFilter.county.length && locationFilter.county.includes(orgID)) {
        org.set('serve_area', 1);
        return true;
      } else if (locationFilter.state && locationFilter.state.length && locationFilter.state.includes(orgID)) {
        org.set('serve_area', 2);
        return true;
      }

      return false;
    }
  });
});
define('impact-public/controllers/home', ['exports', 'ember', 'impact-public/utils/api', 'impact-public/config/environment'], function (exports, _ember, _impactPublicUtilsApi, _impactPublicConfigEnvironment) {
    /* global $ */

    var HomeController = _ember['default'].Controller.extend({
        // TODO: add zip code to the queryParams and separate out the filtering logic into smaller bits of code
        queryParams: ['nameFilterText', 'typeFilterParams'],
        fb: _ember['default'].inject.service(),
        application: _ember['default'].inject.controller(),
        analytics: _ember['default'].inject.service(),
        isImpactApp: _impactPublicConfigEnvironment['default'].isImpactApp,
        start: 0,
        stop: 0,
        noMore: false,
        nameFilterText: null,
        locationFilter: null,
        typeFilter: [],
        typeFilterParams: [],
        firstLoad: true,
        organizationSortProperties: ['serve_area', 'name:asc'],
        milesOptions: _ember['default'].A([{
            value: 5,
            label: '5 miles'
        }, {
            value: 10,
            label: '10 miles'
        }, {
            value: 15,
            label: '15 miles'
        }, {
            value: 20,
            label: '20 miles'
        }, {
            value: 50,
            label: '50 miles'
        }]),
        miles: 5,

        actions: {
            resendReceipts: function resendReceipts(email) {
                if (email) {
                    _impactPublicUtilsApi['default'].post('/giving/resendreceipts', {
                        email: email
                    }, function (json) {
                        if (json.error) {
                            alert(json.error);
                        } else {
                            alert("All of your donations receipts have been re-emailed to you!");
                        }
                    });
                }
                this.set('email', null);
            },

            getMore: function getMore() {
                // don't load new data if we already are or there is no more data to load
                if (this.get('loadingMore')) {
                    return;
                }
                if (this.get('noMore')) {
                    return;
                }

                this.set('loadingMore', true);

                // pass this action up the chain to the actions hash on the route
                this.get('target').send('getMore');
            },

            setNameFilter: function setNameFilter(name) {
                this.set('nameFilterText', name);
                this.set('locationFilter', null);
                this.set('typeFilter', null);
                this.set('allFilter', false);
                this.get('allOrganizationsSorted').setEach('serve_area', null);
                this.get('application').send('scrollTo', 'searchedNonprofit');
            },

            clearSearchFilters: function clearSearchFilters() {
                this.resetFilters();
                $('#name-search-input').focus();
                this.set('zip', null);
            },

            viewAll: function viewAll() {
                this.resetFilters();
                this.get('allOrganizationsSorted').setEach('serve_area', null);
                this.set('zip', null);

                this.set('allFilter', true);
                this.set('hasFilters', true);
                this.set('nameFilter', '');
                this.set('locationFilter', '');
                this.set('typeFilter', []);

                this.get('analytics').track({
                    category: 'nonprofit',
                    action: 'view-all'
                });
            },

            postCodeSearch: function postCodeSearch() {
                var self = this;

                var _getProperties = this.getProperties('zip', 'miles');

                var zip = _getProperties.zip;
                var miles = _getProperties.miles;

                if (!zip) {
                    this.growl.error('Please enter a zip code');
                } else if (!miles) {
                    this.growl.error('Please enter the miles radius');
                } else {
                    this.set('searching', true);
                    this.resetFilters();
                    _impactPublicUtilsApi['default'].post('/location-search/charity', {
                        postal_code: zip,
                        miles: miles
                    }, function (json) {
                        if (json.error) {
                            self.set('searching', false);
                            self.growl.error(json.error);
                        } else {
                            self.set('locationFilter', json);
                            self.set('allFilter', false);
                        }
                    });
                }
            },

            shareOnFacebook: function shareOnFacebook() {
                this.get('fb').ui({
                    method: 'share',
                    href: _impactPublicConfigEnvironment['default'].share_url
                }, function () {});
            },

            resetZip: function resetZip() {
                this.resetFilters();
                this.set('zip', null);
            }
        },

        //Computed Props
        allOrganizationsSorted: _ember['default'].computed.sort('allOrganizations', 'organizationSortProperties'),

        isGHD: _ember['default'].computed.alias('application.isGivingHeartsDay'),

        showCartTotal: _ember['default'].computed.alias('application.donations.length'),

        setTypeFilter: (function () {
            if (this.get('firstLoad') && this.get('typeFilterParams')) {
                if (this.get('mode.is_lah_app')) {
                    //this.send('viewAll');
                    return;
                }
                this.set('firstLoad', false);
                return;
            }
            var selectedTypes = this.get('types').filterBy('isSelected', true);
            if (selectedTypes.length > 0) {
                var typeFilterArray = _.pluck(selectedTypes, 'name');
                this.set('typeFilter', typeFilterArray);
                this.set('allFilter', false);
            } else {
                this.set('typeFilter', []);
            }
            this.set('typeFilterParams', this.get('typeFilter'));
        }).observes('types.@each.isSelected'),

        setTypesFromParams: function setTypesFromParams(typeParams) {
            if (!typeParams && !typeParams.length) {
                return 0;
            }

            var types = this.get('types');
            if (!types) {
                return 0;
            }

            this.get('types').then(function (resolvedTypes) {
                typeParams.forEach(function (typeParam) {
                    resolvedTypes.forEach(function (type) {
                        if (type.get('name').toUpperCase() === typeParam.toUpperCase()) {
                            type.set('isSelected', true);
                        }
                    });
                });
            });
        },

        nameFilterSet: (function () {
            _ember['default'].run.debounce(this, 'nameFilterChanged', 750);
        }).observes('nameFilterText'),

        nameFilterChanged: function nameFilterChanged() {
            var nameFilter = this.get('nameFilterText');
            if (nameFilter) {
                this.set('allFilter', false);
                // this.set('locationFilter', null);
                this.set('zip', '');
            }
            this.filterContent();
        },

        setInstantFilter: (function () {
            this.filterContent();
        }).observes('typeFilter', 'allFilter'),

        setDebouncedFilter: (function () {
            _ember['default'].run.debounce(this, 'filterContent', 750);
        }).observes('locationFilter'),

        filterContent: function filterContent() {
            var self = this;
            var nameFilter = this.get('nameFilterText');
            var locationFilter = this.get('locationFilter');
            var typeFilter = this.get('typeFilter');
            var allFilter = this.get('allFilter');
            var hasFilters = this.get('hasFilters');
            var content = null;
            this.set('searching', true);

            if (allFilter && !nameFilter && !typeFilter && !locationFilter) {
                content = this.get('allOrganizations').sortBy('name');
                this.set('start', 0);
                this.set('stop', 9);
                content.setEach('_showOnPage', false);
                _(10).times(function (n) {
                    if (content[n]) {
                        content[n].set('_showOnPage', true);
                    }
                });
                this.set('searching', false);
                return true;
            } else {
                var setHasFilters = hasFilters;
                var setAllFilter = allFilter;
                content = this.get('allOrganizations.content');
                _.each(content, function (org) {
                    var showOnPage = true;
                    var typeNames = org.get('typeNames');
                    if (!nameFilter && !locationFilter && (!typeFilter || typeFilter.length === 0) && !allFilter) {
                        if (hasFilters) {
                            setHasFilters = false;
                        }
                        org.set('_showOnPage', false);
                        self.set('searching', false);
                        return true;
                    } else {
                        if (!hasFilters) {
                            setHasFilters = true;
                        }

                        if (allFilter) {
                            org.set('_showOnPage', true);
                            self.set('searching', false);
                            return true;
                        }

                        if (locationFilter) {
                            if (_.contains(locationFilter.city, org.get('id'))) {
                                org.set('serve_area', 0);
                            } else if (_.contains(locationFilter.county, org.get('id'))) {
                                org.set('serve_area', 1);
                            } else if (_.contains(locationFilter.state, org.get('id'))) {
                                org.set('serve_area', 2);
                            } else {
                                org.set('serve_area', null);
                                showOnPage = false;
                            }
                            setAllFilter = false;
                        }

                        if (typeFilter && typeFilter.length > 0 && typeNames) {
                            showOnPage = self.compareArrays(typeNames, typeFilter);
                            setAllFilter = false;
                        }

                        if (nameFilter) {
                            // Filter the name just on alphanumeric and spaces (so a search for "Childrens" would result in matches for "Childrens" and "Children's")
                            var sanitizedNameFilter = nameFilter.replace(/[^\w\s]/gi, '').toUpperCase();
                            var sanitizedOrgName = org.get('name').replace(/[^\w\s]/gi, '').toUpperCase();
                            if (sanitizedOrgName.indexOf(sanitizedNameFilter) > -1) {
                                // Passes! Do Nothing.
                            } else if (_.contains(org.get('keywords'), nameFilter.toUpperCase())) {
                                    // Passes! Do Nothing.
                                } else {
                                        showOnPage = false;
                                    }
                            setAllFilter = false;
                        }
                        org.set('_showOnPage', showOnPage);
                    }
                });
                self.set('allFilter', setAllFilter);
                self.set('hasFilters', setHasFilters);
            }

            this.set('searching', false);
        },

        trackNameSearch: function trackNameSearch() {
            this.get('analytics').track({
                category: 'filter',
                action: 'name-search',
                label: this.get('nameFilterText')
            });
        },

        noResults: _ember['default'].computed('allOrganizationsSorted.@each._showOnPage', function () {
            var orgs = this.get('allOrganizationsSorted').filterBy('_showOnPage', true);
            return orgs.length <= 0;
        }),

        compareArrays: function compareArrays(array1, array2) {
            var result = array1.filter(function (a1) {
                return array2.find(function (a2) {
                    return a1 === a2;
                });
            });
            return result && result.length;
        },

        resetLAH: function resetLAH() {
            this.send('viewAll');
        },
        reset: function reset() {
            if (this.get('mode.is_lah_app')) {
                this.resetLAH();
            } else {
                this.set('start', 0);
                this.set('stop', 0);
                this.set('locationFilter', null);
                this.set('nameFilterText', null);
                this.set('typeFilter', null);
                this.set('allFilter', false);
            }
        },

        resetFilters: function resetFilters() {
            this.set('hasFilters', false);
            this.set('allFilter', false);
            this.set('nameFilterText', '');
            this.get('types').setEach('isSelected', false);
            this.set('locationFilter', null);
            this.get('allOrganizations').setEach('serve_area', null);
        }
    });

    exports['default'] = HomeController;
});
/* global _ */
define('impact-public/controllers/recover', ['exports', 'ember', 'impact-public/utils/api'], function (exports, _ember, _impactPublicUtilsApi) {

    var RecoverController = _ember['default'].Controller.extend({
        errors: _ember['default'].A(),

        actions: {
            sendEmail: function sendEmail() {
                this.set('emailSent', true);
                var self = this;

                _impactPublicUtilsApi['default'].get('/users/recover/', {
                    email: this.get('email')
                }, function (response) {
                    self.set("errors", _ember['default'].A());
                    if (response.error === undefined) {
                        self.growl.success("Email sent!");
                        //setTimeout(function() {
                        //    self.transitionToRoute("signin");
                        //}, 1000);
                    } else {
                            if (response.error.indexOf("There is no user with email") >= 0) {
                                self.growl.success("Email sent!");
                            } else {
                                self.get("errors").pushObject(response.error);
                            }
                        }
                });
            }
        }
    });

    exports['default'] = RecoverController;
});
define('impact-public/controllers/signin', ['exports', 'ember', 'impact-public/utils/api', 'impact-public/config/environment'], function (exports, _ember, _impactPublicUtilsApi, _impactPublicConfigEnvironment) {
    /* global gapi */

    var SignInController = _ember['default'].Controller.extend({
        signup: true,
        ghd: _ember['default'].inject.service('manage-ghd'),
        fb: _ember['default'].inject.service(),
        application: _ember['default'].inject.controller(),
        analytics: _ember['default'].inject.service(),
        loading: false,
        alerts: [],
        allowGuest: false,
        queryParams: ['signup'],

        actions: {
            toggleSignUp: function toggleSignUp() {
                this.toggleProperty('signup');
            },
            signin: function signin() {
                this.set('loading', true);
                this.set('alerts', []);
                var email = this.get('email');
                var password = this.get('password');
                var self = this;

                _impactPublicUtilsApi['default'].post('/giving/login', {
                    email: email,
                    password: password
                }, function (json) {
                    if (json.error === undefined && json.token !== undefined) {
                        self.get('application').set('user', json.data);
                        self.get('application').set('token', json.token);
                        self.get('application').set('guest', false);
                        _ember['default'].$.jStorage.set('user', json.data);
                        _ember['default'].$.jStorage.set('token', json.token);
                        _ember['default'].$.jStorage.deleteKey('guest');

                        self.get('analytics').track({
                            category: 'signin',
                            action: 'signin'
                        });

                        if (self.get('application').get('savedTransition')) {
                            self.get('application').get('savedTransition').retry();
                        } else {
                            self.transitionToRoute('account');
                        }
                    } else {
                        self.set('password', '');
                        self.get('alerts').pushObject(json.error);
                    }
                    self.set('loading', false);
                });
            },
            signup: function signup() {
                this.set('loading', true);
                this.set('alerts', []);
                var email = this.get('email');
                var confirmEmail = this.get('confirmEmail');
                var password = this.get('password');
                var confirmPassword = this.get('confirmPassword');
                var firstName = this.get('firstName');
                var lastName = this.get('lastName');

                if (email !== confirmEmail) {
                    this.get('alerts').pushObject('Emails do not match');
                    this.set('confirmEmail', '');
                }
                if (password !== confirmPassword) {
                    this.get('alerts').pushObject('Passwords do not match');
                    this.set('password', '');
                    this.set('confirmPassword', '');
                }

                if (this.get('alerts').length === 0) {
                    var self = this;
                    //Do the signup here
                    _impactPublicUtilsApi['default'].post('/giving/register', {
                        email: email,
                        password: password,
                        first_name: firstName,
                        last_name: lastName
                    }, function (json) {
                        if (json.error === undefined && json.token !== undefined) {
                            self.get('application').set('user', json.data);
                            self.get('application').set('token', json.token);
                            self.get('application').set('guest', false);
                            _ember['default'].$.jStorage.set('user', json.data);
                            _ember['default'].$.jStorage.set('token', json.token);
                            _ember['default'].$.jStorage.deleteKey('guest');

                            if (self.get('application').get('savedTransition')) {
                                self.get('application').get('savedTransition').retry();
                            } else {
                                self.transitionToRoute('account');
                            }
                        } else {
                            self.set('confirmEmail', '');
                            self.set('password', '');
                            self.set('confirmPassword', '');
                            self.get('alerts').pushObject(json.error);
                        }
                        self.set('loading', false);
                        self.get('analytics').track({
                            category: 'signin',
                            action: 'signup'
                        });
                    });
                } else {
                    this.set('loading', false);
                }
            },
            signinFacebook: function signinFacebook() {
                this.set('alerts', []);
                this.set('loading', true);
                var self = this;
                //Check for facebook login
                this.get('fb').login(function () {
                    this.get('fb').getLoginStatus(function (response) {
                        self.set('loading', true);
                        if (response.status === 'connected') {
                            console.log('Facebook Logged in.');
                            this.get('fb').api('/me', function (response) {
                                if (!response.id || !response.email || !response.last_name || !response.first_name) {
                                    self.get('alerts').pushObject('An error occurred while trying to sign in with Facebook. Please try again.');
                                    self.set('loading', false);
                                } else {
                                    _impactPublicUtilsApi['default'].post('/giving/register/social', {
                                        is_facebook: true,
                                        email: response.email,
                                        facebook_id: response.id,
                                        first_name: response.first_name,
                                        last_name: response.last_name
                                    }, function (json) {
                                        if (json.error === undefined && json.token !== undefined) {
                                            self.get('controllers.application').set('user', json.data);
                                            self.get('controllers.application').set('token', json.token);
                                            self.get('application').set('guest', false);
                                            _ember['default'].$.jStorage.set('user', json.data);
                                            _ember['default'].$.jStorage.set('token', json.token);
                                            _ember['default'].$.jStorage.deleteKey('guest');

                                            self.get('analytics').track({
                                                category: 'signin',
                                                action: 'facebook'
                                            });

                                            if (self.get('application').get('savedTransition')) {
                                                self.get('application').get('savedTransition').retry();
                                            } else {
                                                self.transitionToRoute('account');
                                            }
                                        } else if (json.error === 'Social ID has already been registered.') {
                                            //If we already have a record for this facebook user, then we can log them in
                                            console.log('User has already given us facebook permissions. Go ahead and log them in.');
                                            _impactPublicUtilsApi['default'].get('/giving/login/social', {
                                                email: response.email,
                                                is_facebook: true,
                                                facebook_id: response.id
                                            }, function (json) {
                                                if (json.error === undefined && json.token !== undefined) {
                                                    self.get('application').set('user', json.data);
                                                    self.get('application').set('token', json.token);
                                                    self.get('application').set('guest', false);
                                                    _ember['default'].$.jStorage.set('user', json.data);
                                                    _ember['default'].$.jStorage.set('token', json.token);
                                                    _ember['default'].$.jStorage.deleteKey('guest');

                                                    if (self.get('application').get('savedTransition')) {
                                                        self.get('application').get('savedTransition').retry();
                                                    } else {
                                                        self.transitionToRoute('account');
                                                    }
                                                } else {
                                                    self.get('alerts').pushObject(json.error);
                                                    console.log(json);
                                                }
                                            });
                                        } else {
                                            self.get('alerts').pushObject(json.error);
                                            console.log(json);
                                        }
                                        self.set('loading', false);
                                    });
                                    console.log('Successful login for: ' + response.name);
                                }
                            });
                        } else {
                            console.log('No facebook login');
                            self.get('alerts').pushObject('An error occured when trying to log you in using Facebook. Please try again.');
                            self.set('loading', false);
                        }
                    });
                }, {
                    scope: 'email',
                    auth_type: 'rerequest'
                });
                this.set('loading', false);
            },
            signinGoogle: function signinGoogle() {
                this.set('alerts', []);
                this.set('loading', true);
                var self = this;
                gapi.auth.authorize({
                    client_id: _impactPublicConfigEnvironment['default'].auth.gapi,
                    scope: 'email',
                    immediate: false
                }, function (authResult) {
                    self.set('loading', true);
                    if (authResult['status']['signed_in']) {
                        console.log('Google auth success');
                        gapi.client.load('plus', 'v1').then(function () {
                            var request = gapi.client.plus.people.get({
                                'userId': 'me'
                            });
                            request.then(function (response) {
                                //Get the first email from the array of email addresses in the result
                                var email = response.result.emails[0].value;
                                if (!email || !response.result.id || !response.result.name.givenName || !response.result.name.familyName) {
                                    self.get('alerts').pushObject('An error occurred while trying to sign in with Google. Please try again.');
                                    self.set('loading', false);
                                } else {
                                    _impactPublicUtilsApi['default'].post('/giving/register/social', {
                                        is_google: true,
                                        email: email,
                                        google_id: response.result.id,
                                        first_name: response.result.name.givenName,
                                        last_name: response.result.name.familyName
                                    }, function (json) {
                                        if (json.error === undefined && json.token !== undefined) {
                                            self.get('application').set('user', json.data);
                                            self.get('application').set('token', json.token);
                                            self.get('application').set('guest', false);
                                            _ember['default'].$.jStorage.set('user', json.data);
                                            _ember['default'].$.jStorage.set('token', json.token);
                                            _ember['default'].$.jStorage.deleteKey('guest');

                                            self.get('analytics').track({
                                                category: 'signin',
                                                action: 'google'
                                            });

                                            if (self.get('application').get('savedTransition')) {
                                                self.get('application').get('savedTransition').retry();
                                            } else {
                                                self.transitionToRoute('account');
                                            }
                                            self.set('loading', false);
                                        } else if (json.error === 'Social ID has already been registered.') {
                                            //If we already have a record for this google user, then we can log them in
                                            console.log('User has already given us google permissions. Go ahead and log them in.');
                                            _impactPublicUtilsApi['default'].get('/giving/login/social', {
                                                email: email,
                                                is_google: true,
                                                google_id: response.result.id
                                            }, function (json) {
                                                if (json.error === undefined && json.token !== undefined) {
                                                    self.get('application').set('user', json.data);
                                                    self.get('application').set('token', json.token);
                                                    self.get('application').set('guest', false);
                                                    _ember['default'].$.jStorage.set('user', json.data);
                                                    _ember['default'].$.jStorage.set('token', json.token);
                                                    _ember['default'].$.jStorage.deleteKey('guest');

                                                    if (self.get('application').get('savedTransition')) {
                                                        self.get('application').get('savedTransition').retry();
                                                    } else {
                                                        self.transitionToRoute('account');
                                                    }
                                                } else {
                                                    self.get('alerts').pushObject(json.error);
                                                    console.log(json);
                                                }
                                                self.set('loading', false);
                                            });
                                        } else {
                                            self.set('loading', false);
                                            self.get('alerts').pushObject(json.error);
                                            console.log(json);
                                        }
                                        self.set('loading', false);
                                    });
                                    console.log('Successful login for: ' + response.result.displayName);
                                }
                            }, function (reason) {
                                console.log('Error: ' + reason.result.error.message);
                            });
                        });
                    } else {
                        console.log('No google login');
                        self.get('alerts').pushObject('An error occured when trying to log you in using Google. Please try again.');
                        self.set('loading', false);
                        console.log('Google Sign-in state: ' + authResult['error']);
                    }
                });
                this.set('loading', false);
            },
            guestCheckout: function guestCheckout() {
                this.get('analytics').track({
                    category: 'signin',
                    action: 'guest'
                });

                this.get('application').set('guest', true);
                //save this to local storage
                _ember['default'].$.jStorage.set('guest', true);
                this.get('application').get('savedTransition').retry();
            }
        },

        reset: function reset() {
            this.set('email', '');
            this.set('password', '');
            this.set('confirmEmail', '');
            this.set('confirmPassword', '');
            this.set('firstName', '');
            this.set('lastName', '');
            this.set('alerts', []);
            this.set('loading', false);
        }
    });

    exports['default'] = SignInController;
});
define('impact-public/controllers/volunteer/index', ['exports', 'ember', 'impact-public/utils/api', 'impact-public/models/organizations'], function (exports, _ember, _impactPublicUtilsApi, _impactPublicModelsOrganizations) {
    exports['default'] = _ember['default'].Controller.extend({
        queryParams: ['charity', 'ongoing'],
        ongoing: true,
        oneTime: false,
        all: false,
        charity: 0,
        hasMore: true,
        ongoingSortProperties: ['title'],
        nameFilterText: '',
        type_options_checked: [],
        time_commitment_options_checked: [],
        skill_options_checked: [],
        doNotFilterOnInit: true,
        milesOptions: [{
            value: 5,
            label: '5 miles'
        }, {
            value: 10,
            label: '10 miles'
        }, {
            value: 15,
            label: '15 miles'
        }, {
            value: 20,
            label: '20 miles'
        }, {
            value: 50,
            label: '50 miles'
        }],
        miles: 5,
        offset: 5,
        limit: 4,

        //allOpportunitiesSorted: Ember.computed('model.volunteer_opportunites', function () {
        //    return this.get('model.volunteer_opportunities');
        //}),

        loadedOpportunies: _ember['default'].computed.map('model.volunteer_opportunities', function (opp) {
            //attaching the org data so that we can filter on non-active ones down below in ongoingOpportunities
            opp.orgStatus = _impactPublicModelsOrganizations['default'].find(opp.get('organization').id);
            if (opp.get('organization') == null) {
                opp.get('organization');
            }
            return opp;
        }),

        eventOpportunities: _ember['default'].computed('loadedOpportunies', function () {
            return this.get('loadedOpportunies').filterBy('ongoing', false);
        }),

        eventOpportunitiesSorted: _ember['default'].computed.sort('eventOpportunities', function (a, b) {
            return _ember['default'].compare(a.get('end_date'), b.get('end_date'));
        }),

        eventOpportunitiesVisible: _ember['default'].computed('eventOpportunitiesSorted.@each._showOnPage', function () {
            return this.get('eventOpportunitiesSorted').filterBy('_showOnPage', true);
        }),

        ongoingOpportunities: _ember['default'].computed('loadedOpportunies', function () {
            // filtering also based on whether the org is active, had to attach the org data above in loadedOpportunies
            return this.get('loadedOpportunies').filterBy('ongoing', true).filter(function (opp) {
                return opp.orgStatus.status === 'active';
            });
        }),

        ongoingOpportunitiesSorted: _ember['default'].computed.sort('ongoingOpportunities', 'ongoingSortProperties'),

        ongoingOpportunitiesVisible: _ember['default'].computed('ongoingOpportunitiesSorted.@each._showOnPage', function () {
            return this.get('ongoingOpportunitiesSorted').filterBy('_showOnPage', true);
        }),

        //allOpportunitiesVisible: Ember.computed('allOpportunitiesSorted.@each._showOnPage', function () {
        //    return this.get('allOpportunitiesSorted').filterBy('_showOnPage', true).length;
        //}),

        noResults: _ember['default'].computed('loadedOpportunies.@each._showOnPage', function () {
            return this.get('loadedOpportunies').filterBy('_showOnPage', true).length <= 0;
        }),

        observeCharity: _ember['default'].observer('charity', function () {
            if (this.get('charity') && this.get('charity') > 0) {
                this.set('allFilter', false);
            }
        }),

        setFilter: (function () {
            this.set('searching', true);
            _ember['default'].run.debounce(this, this.filterContent, 1000);
        }).observes('locationFilter', 'nameFilterText', 'type_options_checked.[]', 'skill_options_checked.[]', 'charity'),

        actions: {
            getMore: function getMore() {
                var opp_type = '';
                if (this.get('all')) {
                    opp_type = 'all';
                } else if (this.get('ongoing')) {
                    opp_type = 'ongoing';
                } else {
                    opp_type = 'event';
                }
                // don't load new data if we already are or there is no more data to load
                if (this.get('loadingMore')) {
                    return;
                }
                if (this.get('no_more_' + opp_type)) {
                    return;
                }

                this.set('loadingMore', true);

                var start = this.get('start_' + opp_type) + 5,
                    stop = this.get('stop_' + opp_type) + 5;
                //items = this.send('fetchMore', offset);
                this.set('start_' + opp_type, start);
                this.set('stop_' + opp_type, stop);
                var model = this.get(opp_type + 'OpportunitiesSorted');
                if (stop > model.get('length') - 1) {
                    this.set('no_more_' + opp_type, true);
                    stop = model.get('length') - 1;
                }
                for (var i = start; i <= stop; i++) {
                    model.objectAt(i).set('_showOnPage', true);
                }
                this.set('loadingMore', false);
            },

            postCodeSearch: function postCodeSearch() {
                var self = this;

                var _getProperties = this.getProperties('zip', 'miles');

                var zip = _getProperties.zip;
                var miles = _getProperties.miles;

                if (!zip) {
                    this.growl.error('Please enter a zip code');
                } else if (!miles) {
                    this.growl.error('Please enter the miles radius');
                } else {
                    this.set('searching', true);
                    this.resetFilters();
                    _impactPublicUtilsApi['default'].post('/location-search/volunteer', {
                        postal_code: zip,
                        miles: miles
                    }, function (json) {
                        if (json.error) {
                            self.growl.error(json.error.message);
                            self.set('locationFilter', []);
                            self.set('allFilter', false);
                        } else {
                            self.set('locationFilter', json);
                            self.set('allFilter', false);
                        }
                    });
                }
            },

            resetZip: function resetZip() {
                if (this.get('locationFilter') && this.get('locationFilter.length') > 0) {
                    this.resetFilters();
                    this.set('zip', null);
                }
            },

            clearSearchFilters: function clearSearchFilters() {
                this.resetFilters();
                _ember['default'].$('#name-search-input').focus();
                this.set('zip', null);
            },

            setVisibility: function setVisibility(visible) {
                var props = {};
                if (visible === 'ongoing') {
                    props = {
                        ongoing: true,
                        all: false,
                        oneTime: false
                    };
                } else if (visible === 'oneTime') {
                    props = {
                        ongoing: false,
                        all: false,
                        oneTime: true
                    };
                } else if (visible === 'all') {
                    props = {
                        ongoing: false,
                        all: true,
                        oneTime: false
                    };
                }

                this.setProperties(props);
            }
        },

        filterContent: function filterContent() {
            var self = this;
            var nameFilter = this.get('nameFilterText');
            var locationFilter = this.get('locationFilter');
            var typeFilter = this.get('type_options_checked');
            var skillsFilter = this.get('skill_options_checked');
            var charityFilter = this.get('charity');
            this.set('searching', true);

            var opps = this.get('model.volunteer_opportunities');
            if (!nameFilter && (!typeFilter || typeFilter.length === 0) && (!locationFilter || locationFilter.length === 0) && (!skillsFilter || skillsFilter.length === 0) && !charityFilter) {
                this.setupAllFilter();
            } else {
                this.set('hasFilters', true);

                opps.forEach(function (opp) {
                    var typeNames = _.pluck(opp.get('types'), 'name');
                    var skills = opp.get('skills');
                    //org.set('_showOnPage', true);
                    //if (!hasFilters) {
                    //    self.set('hasFilters', true);
                    //}

                    if (charityFilter) {
                        if (opp.get('organization_id') === charityFilter) {
                            //Passes! Do nothing.
                        } else {
                                opp.set('_showOnPage', false);
                                self.set('searching', false);
                                return false;
                            }
                    }

                    if (locationFilter) {
                        if (!_.contains(locationFilter, opp.get('id'))) {
                            opp.set('_showOnPage', false);
                            self.set('searching', false);
                            return false;
                        }
                    }

                    if (typeFilter && typeFilter.length > 0 && typeNames) {
                        //if (_.intersection(typeNames, typeFilter).length > 0) {
                        if (self.compareArrays(typeNames, typeFilter)) {
                            //Passes!  Do Nothing.
                            //console.log(org);
                        } else {
                                opp.set('_showOnPage', false);
                                self.set('searching', false);
                                return false;
                            }
                    }

                    if (skillsFilter && skillsFilter.length > 0 && skills) {
                        if (self.compareArrays(skills, skillsFilter)) {
                            //Passes!  Do Nothing.
                        } else {
                                opp.set('_showOnPage', false);
                                self.set('searching', false);
                                return false;
                            }
                    }

                    if (nameFilter) {
                        var title = opp.get('title').toUpperCase();
                        var description = (opp.get('description') || '').toLowerCase();
                        var organization = (opp.get('organization').get('name') || '').toLowerCase();
                        if (title.indexOf(nameFilter.toUpperCase()) > -1) {
                            //Passes!  Do Nothing.
                        } else if (description.indexOf(nameFilter.toLowerCase()) > -1) {
                                //Passes. Do Nothing
                            } else if (organization.indexOf(nameFilter.toLowerCase()) > -1) {
                                    //Passes. Do Nothing
                                } else {
                                        opp.set('_showOnPage', false);
                                        self.set('searching', false);
                                        return false;
                                    }
                    }
                    self.set('allFilter', false);
                    opp.set('_showOnPage', true);
                });
            }

            this.set('searching', false);
        },

        setupAllFilter: function setupAllFilter() {
            this.set('allFilter', true);
            this.set('hasFilters', false);

            var ongoingOpps = this.get('ongoingOpportunitiesSorted');
            var eventOpps = this.get('eventOpportunitiesSorted');
            //var allOpps = this.get('allOpportunitiesSorted');

            ongoingOpps.setEach('_showOnPage', false);
            eventOpps.setEach('_showOnPage', false);
            //allOpps.setEach('_showOnPage', false);

            var ongoingLength = ongoingOpps.get('length');
            var eventLength = eventOpps.get('length');
            //var allOppsLength = allOpps.get('length');

            if (ongoingLength <= 5) {
                ongoingOpps.setEach('_showOnPage', true);
                this.set('no_more_ongoing', true);
            } else {
                this.set('no_more_ongoing', false);
                this.set('start_ongoing', 0);
                this.set('stop_ongoing', 4);
                ongoingOpps.setEach('_showOnPage', false);
                _(5).times(function (n) {
                    if (ongoingOpps[n]) {
                        ongoingOpps[n].set('_showOnPage', true);
                    }
                });
            }

            if (eventLength <= 5) {
                eventOpps.setEach('_showOnPage', true);
                this.set('no_more_event', true);
            } else {
                this.set('no_more_event', false);
                this.set('start_event', 0);
                this.set('stop_event', 4);
                eventOpps.setEach('_showOnPage', false);
                _(5).times(function (n) {
                    if (eventOpps[n]) {
                        eventOpps[n].set('_showOnPage', true);
                    }
                });
            }

            //if (allOppsLength <= 5) {
            //    allOpps.setEach('_showOnPage', true);
            //    this.set('no_more_all', true);
            //} else {
            //    this.set('no_more_all', false);
            //    this.set('start_all', 0);
            //    this.set('stop_all', 4);
            //    eventOpps.setEach('_showOnPage', false);
            //    _(5).times(function(n) {
            //        if (eventOpps[n]) {
            //            eventOpps[n].set('_showOnPage', true);
            //        }
            //    });
            //}
        },

        resetFilters: function resetFilters() {
            this.set('allFilter', true);
            this.set('hasFilters', false);
            this.set('nameFilterText', '');
            this.set('type_options_checked', []);
            this.set('skill_options_checked', []);
            this.get('model.types').setEach('isSelected', false);
            this.get('model.skills').setEach('checked', false);
            this.set('locationFilter', null);
            this.set('charity', 0);
        },

        findFiltersApplied: function findFiltersApplied(type, tc_commiment, text, skills) {
            var filtersApplied = {};
            if (type && type.length > 0) {
                filtersApplied.type = true;
            } else {
                filtersApplied.type = false;
            }
            if (skills && skills.length > 0) {
                filtersApplied.skills = true;
            } else {
                filtersApplied.skills = false;
            }
            if (tc_commiment && tc_commiment.length > 0) {
                filtersApplied.tc_commitment = true;
            } else {
                filtersApplied.tc_commitment = false;
            }
            if (text !== null) {
                filtersApplied.text = true;
            } else {
                filtersApplied.text = false;
            }
            return filtersApplied;
        },

        compareArrays: function compareArrays(array1, array2) {
            var result = _.find(array2, function (element) {
                if (_.indexOf(array1, element) !== -1) {
                    return true;
                }
            });

            if (result) {
                return true;
            } else {
                return false;
            }
        }
    });
});
/* global _ */
define('impact-public/controllers/volunteer/opportunity', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({

        submissionErrors: null,
        userJustApplied: false,
        userPreviouslyApplied: false,

        init: function init() {
            this.submissionErrors = _ember['default'].Object.extend({
                hasErrors: _ember['default'].computed('first_name', 'last_name', 'email', 'phone', function () {
                    return this.get('first_name') || this.get('last_name') || this.get('email') || this.get('phone');
                })
            }).create({
                first_name: false,
                last_name: false,
                email: false,
                phone: false
            });

            this._super.apply(this, arguments);
        },

        userAlreadyApplied: _ember['default'].computed('userJustApplied', 'userPreviouslyApplied', function () {
            return this.get('userJustApplied') || this.get('userPreviouslyApplied');
        }),

        shouldActivelyValidate: _ember['default'].computed('activeValidate', function () {
            return this.get('activeValidate');
        }),

        hasContactInfo: _ember['default'].computed('model.op.contact_name', 'model.op.contact_email', 'model.op.contact_phone', function () {
            return this.get('model.op.contact_name') || this.get('model.op.contact_email') || this.get('model.op.contact_phone');
        }),

        submitSuccess: function submitSuccess() {
            console.log('success!');
            this.set('userJustApplied', true);
        },

        submitFailure: function submitFailure() {
            console.log('failure!');
        },

        validSubmission: function validSubmission() {
            console.log(this.submission);
        },

        actions: {
            submitApplication: function submitApplication() {
                var self = this;

                self.get('submission').saveRecord().then(self.submitSuccess.bind(self), self.submitFailure.bind(self));
            }
        }

    });
});
define('impact-public/ga', ['exports'], function (exports) {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', '{{APP_ID}}']);
  _gaq.push(['_setSiteSpeedSampleRate', 10]);
  _gaq.push(['_trackPageview']);

  (function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();
});
define('impact-public/helpers/and', ['exports', 'ember', 'ember-truth-helpers/helpers/and'], function (exports, _ember, _emberTruthHelpersHelpersAnd) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersAnd.andHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersAnd.andHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/app-version', ['exports', 'ember', 'impact-public/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _ember, _impactPublicConfigEnvironment, _emberCliAppVersionUtilsRegexp) {
  exports.appVersion = appVersion;
  var version = _impactPublicConfigEnvironment['default'].APP.version;

  function appVersion(_) {
    var hash = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (hash.hideSha) {
      return version.match(_emberCliAppVersionUtilsRegexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_emberCliAppVersionUtilsRegexp.shaRegExp)[0];
    }

    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('impact-public/helpers/break-lines', ['exports', 'ember'], function (exports, _ember) {
    exports.breakLines = breakLines;

    function breakLines(params /*, hash*/) {
        var text = params[0];
        text = _ember['default'].Handlebars.Utils.escapeExpression(text);
        text = text.toString();
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        return _ember['default'].String.htmlSafe(text);
    }

    exports['default'] = _ember['default'].Helper.helper(breakLines);
});
define('impact-public/helpers/cancel-all', ['exports', 'ember', 'ember-concurrency/-helpers'], function (exports, _ember, _emberConcurrencyHelpers) {
  exports.cancelHelper = cancelHelper;

  var CANCEL_REASON = "the 'cancel-all' template helper was invoked";

  function cancelHelper(args) {
    var cancelable = args[0];
    if (!cancelable || typeof cancelable.cancelAll !== 'function') {
      _ember['default'].assert('The first argument passed to the `cancel-all` helper should be a Task or TaskGroup (without quotes); you passed ' + cancelable, false);
    }

    return (0, _emberConcurrencyHelpers.taskHelperClosure)('cancelAll', [cancelable, CANCEL_REASON]);
  }

  exports['default'] = _ember['default'].Helper.helper(cancelHelper);
});
define('impact-public/helpers/cents-to-dollars', ['exports', 'ember', 'numeral'], function (exports, _ember, _numeral) {

    //Converts from cents to dollars.
    var helper = _ember['default'].Helper.helper(function (params) {
        var cents = params[0];
        if (!cents) {
            return "0";
        }
        var dollars = cents / 100;
        dollars = (0, _numeral['default'])(dollars.toFixed(2)).format('0,0.00');
        return _ember['default'].String.htmlSafe(dollars);
    });

    exports['default'] = helper;
});
define("impact-public/helpers/charity-list-helper", ["exports"], function (exports) {
    exports.buildOrderedGroupedCharities = buildOrderedGroupedCharities;
    /* global _ */

    /**
     * Sorts and Groups charities by the first letter in the Charity name,
     * also on GHD it will filter to only return charities that have ghd_access = true
     */

    function buildOrderedGroupedCharities(charities, isGHD, is_lah_app) {

        var filteredCharities = [];

        if (!isGHD || is_lah_app) {
            filteredCharities = charities;
        } else {
            filteredCharities = charities.filter(function (charity) {
                return charity.ghd_access === true;
            });
        }

        var groupedCharities = _.groupBy(filteredCharities, function (charity) {
            return charity.name.substr(0, 1);
        });
        return Object.keys(groupedCharities).sort().map(function (letter) {
            return {
                letter: letter,
                charities: groupedCharities[letter]
            };
        });
    }
});
define('impact-public/helpers/charity-type-id-to-symbol', ['exports', 'ember'], function (exports, _ember) {
    // converts an organizations type id to the respective symbol
    exports['default'] = _ember['default'].Helper.helper(function (args) {
        var id = args[0];
        var name = args[1];
        var symbol = '';
        switch (id) {
            case 1:
                symbol = 'icon-paw';
                break;
            case 2:
                symbol = 'icon-paint-brush';
                break;
            case 3:
                symbol = "icon-cutlery";
                break;
            case 4:
                symbol = 'icon-life-bouy';
                break;
            case 5:
                symbol = 'icon-wheelchair';
                break;
            case 6:
                symbol = 'icon-graduation-cap';
                break;
            case 7:
                symbol = 'icon-faith';
                break;
            case 8:
                symbol = 'icon-stethoscope';
                break;
            case 9:
                symbol = 'icon-youth';
                break;
            case 10:
                symbol = 'icon-dmf';
                break;
            case 11:
                symbol = 'icon-impact';
                break;
        }

        return _ember['default'].String.htmlSafe('<span title="' + (name ? name : "") + '" class="' + symbol + '"></span>');
    });
});
define('impact-public/helpers/closetr', ['exports', 'ember'], function (exports, _ember) {
    exports.closetr = closetr;

    function closetr(params /*, hash*/) {
        return params[0] % 2 === 0 ? _ember['default'].String.htmlSafe('</tr>') : '';
    }

    exports['default'] = _ember['default'].Helper.helper(closetr);
});
define('impact-public/helpers/ember-power-select-is-group', ['exports', 'ember-power-select/helpers/ember-power-select-is-group'], function (exports, _emberPowerSelectHelpersEmberPowerSelectIsGroup) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsGroup['default'];
    }
  });
  Object.defineProperty(exports, 'emberPowerSelectIsGroup', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsGroup.emberPowerSelectIsGroup;
    }
  });
});
define('impact-public/helpers/ember-power-select-is-selected', ['exports', 'ember-power-select/helpers/ember-power-select-is-selected'], function (exports, _emberPowerSelectHelpersEmberPowerSelectIsSelected) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsSelected['default'];
    }
  });
  Object.defineProperty(exports, 'emberPowerSelectIsSelected', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsSelected.emberPowerSelectIsSelected;
    }
  });
});
define('impact-public/helpers/ember-power-select-true-string-if-present', ['exports', 'ember-power-select/helpers/ember-power-select-true-string-if-present'], function (exports, _emberPowerSelectHelpersEmberPowerSelectTrueStringIfPresent) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectTrueStringIfPresent['default'];
    }
  });
  Object.defineProperty(exports, 'emberPowerSelectTrueStringIfPresent', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectTrueStringIfPresent.emberPowerSelectTrueStringIfPresent;
    }
  });
});
define('impact-public/helpers/eq', ['exports', 'ember', 'ember-truth-helpers/helpers/equal'], function (exports, _ember, _emberTruthHelpersHelpersEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersEqual.equalHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersEqual.equalHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/gt', ['exports', 'ember', 'ember-truth-helpers/helpers/gt'], function (exports, _ember, _emberTruthHelpersHelpersGt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGt.gtHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGt.gtHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/gte', ['exports', 'ember', 'ember-truth-helpers/helpers/gte'], function (exports, _ember, _emberTruthHelpersHelpersGte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGte.gteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGte.gteHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/is-after', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/is-after'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersIsAfter) {
  exports['default'] = _emberMomentHelpersIsAfter['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/is-array', ['exports', 'ember', 'ember-truth-helpers/helpers/is-array'], function (exports, _ember, _emberTruthHelpersHelpersIsArray) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/is-before', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/is-before'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersIsBefore) {
  exports['default'] = _emberMomentHelpersIsBefore['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/is-between', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/is-between'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersIsBetween) {
  exports['default'] = _emberMomentHelpersIsBetween['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/is-equal', ['exports', 'ember-truth-helpers/helpers/is-equal'], function (exports, _emberTruthHelpersHelpersIsEqual) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberTruthHelpersHelpersIsEqual['default'];
    }
  });
  Object.defineProperty(exports, 'isEqual', {
    enumerable: true,
    get: function get() {
      return _emberTruthHelpersHelpersIsEqual.isEqual;
    }
  });
});
define('impact-public/helpers/is-same-or-after', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/is-same-or-after'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersIsSameOrAfter) {
  exports['default'] = _emberMomentHelpersIsSameOrAfter['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/is-same-or-before', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/is-same-or-before'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersIsSameOrBefore) {
  exports['default'] = _emberMomentHelpersIsSameOrBefore['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/is-same', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/is-same'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersIsSame) {
  exports['default'] = _emberMomentHelpersIsSame['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/lt', ['exports', 'ember', 'ember-truth-helpers/helpers/lt'], function (exports, _ember, _emberTruthHelpersHelpersLt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLt.ltHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLt.ltHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/lte', ['exports', 'ember', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersHelpersLte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLte.lteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/moment-add', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-add'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentAdd) {
  exports['default'] = _emberMomentHelpersMomentAdd['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-calendar', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-calendar'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentCalendar) {
  exports['default'] = _emberMomentHelpersMomentCalendar['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-diff', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-diff'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentDiff) {
  exports['default'] = _emberMomentHelpersMomentDiff['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, _emberMomentHelpersMomentDuration) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersMomentDuration['default'];
    }
  });
});
define('impact-public/helpers/moment-format', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-format'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentFormat) {
  exports['default'] = _emberMomentHelpersMomentFormat['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-from-now', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-from-now'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentFromNow) {
  exports['default'] = _emberMomentHelpersMomentFromNow['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-from', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-from'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentFrom) {
  exports['default'] = _emberMomentHelpersMomentFrom['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-subtract', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-subtract'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentSubtract) {
  exports['default'] = _emberMomentHelpersMomentSubtract['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-to-date', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-to-date'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentToDate) {
  exports['default'] = _emberMomentHelpersMomentToDate['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-to-now', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-to-now'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentToNow) {
  exports['default'] = _emberMomentHelpersMomentToNow['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-to', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/helpers/moment-to'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentHelpersMomentTo) {
  exports['default'] = _emberMomentHelpersMomentTo['default'].extend({
    globalAllowEmpty: !!_ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.allowEmpty')
  });
});
define('impact-public/helpers/moment-unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _emberMomentHelpersUnix) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersUnix['default'];
    }
  });
  Object.defineProperty(exports, 'unix', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersUnix.unix;
    }
  });
});
define('impact-public/helpers/moment', ['exports', 'ember-moment/helpers/moment'], function (exports, _emberMomentHelpersMoment) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersMoment['default'];
    }
  });
});
define('impact-public/helpers/money-no-cents', ['exports', 'ember', 'numeral'], function (exports, _ember, _numeral) {

    //Converts normal string money with format
    exports['default'] = _ember['default'].Helper.helper(function (args) {
        var money = args[0];
        if (!money) {
            return "0.00";
        }

        var dollars = (0, _numeral['default'])(money).format('0,0.00');
        return _ember['default'].String.htmlSafe(dollars);
    });
});
define('impact-public/helpers/money-rounded', ['exports', 'ember', 'numeral'], function (exports, _ember, _numeral) {

    //Converts from cents to dollars.
    exports['default'] = _ember['default'].Helper.helper(function (cents) {
        if (!cents) {
            return "0";
        }
        var dollars = cents / 100;
        dollars = (0, _numeral['default'])(dollars.toFixed()).format('0,0');
        return _ember['default'].String.htmlSafe(dollars);
    });
});
define('impact-public/helpers/not-eq', ['exports', 'ember', 'ember-truth-helpers/helpers/not-equal'], function (exports, _ember, _emberTruthHelpersHelpersNotEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/not', ['exports', 'ember', 'ember-truth-helpers/helpers/not'], function (exports, _ember, _emberTruthHelpersHelpersNot) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNot.notHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNot.notHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/now', ['exports', 'ember-moment/helpers/now'], function (exports, _emberMomentHelpersNow) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersNow['default'];
    }
  });
});
define('impact-public/helpers/opentr', ['exports', 'ember'], function (exports, _ember) {
    exports.opentr = opentr;

    function opentr(params /*, hash*/) {
        return params[0] % 2 === 0 ? _ember['default'].String.htmlSafe('<tr>') : '';
    }

    exports['default'] = _ember['default'].Helper.helper(opentr);
});
define('impact-public/helpers/or', ['exports', 'ember', 'ember-truth-helpers/helpers/or'], function (exports, _ember, _emberTruthHelpersHelpersOr) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersOr.orHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersOr.orHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/helpers/perform', ['exports', 'ember', 'ember-concurrency/-helpers'], function (exports, _ember, _emberConcurrencyHelpers) {
  exports.performHelper = performHelper;

  function performHelper(args, hash) {
    return (0, _emberConcurrencyHelpers.taskHelperClosure)('perform', args, hash);
  }

  exports['default'] = _ember['default'].Helper.helper(performHelper);
});
define('impact-public/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('impact-public/helpers/pretty-date', ['exports', 'ember', 'moment'], function (exports, _ember, _moment) {

    //Makes dates pretty.  Defaults to "MM/DD/YYYY"
    //Can set the format my adding the optional 'format' param. e.g.: {{prettyDate myDate format="MMM DD"}}
    var helper = _ember['default'].Helper.helper(function (params, options) {
        var date = params[0];
        var format = options.format;
        if (!date) {
            return "";
        }
        if (!format) {
            format = 'MM/DD/YYYY';
        }
        var text = _moment['default'].utc(date).local().format(format);
        return _ember['default'].String.htmlSafe(text);
    });

    exports['default'] = helper;
});
define('impact-public/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('impact-public/helpers/task', ['exports', 'ember'], function (exports, _ember) {
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function taskHelper(_ref) {
    var _ref2 = _toArray(_ref);

    var task = _ref2[0];

    var args = _ref2.slice(1);

    return task._curry.apply(task, _toConsumableArray(args));
  }

  exports['default'] = _ember['default'].Helper.helper(taskHelper);
});
define('impact-public/helpers/to-lower-case', ['exports', 'ember'], function (exports, _ember) {
    exports.toLowerCase = toLowerCase;

    function toLowerCase(params) {
        var result = params[0] || '';
        return result.toLowerCase();
    }

    exports['default'] = _ember['default'].Helper.helper(toLowerCase);
});
define('impact-public/helpers/unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _emberMomentHelpersUnix) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersUnix['default'];
    }
  });
  Object.defineProperty(exports, 'unix', {
    enumerable: true,
    get: function get() {
      return _emberMomentHelpersUnix.unix;
    }
  });
});
define('impact-public/helpers/xor', ['exports', 'ember', 'ember-truth-helpers/helpers/xor'], function (exports, _ember, _emberTruthHelpersHelpersXor) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersXor.xorHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersXor.xorHelper);
  }

  exports['default'] = forExport;
});
define('impact-public/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'impact-public/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _impactPublicConfigEnvironment) {
  var _config$APP = _impactPublicConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('impact-public/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('impact-public/initializers/data-adapter', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('impact-public/initializers/ember-concurrency', ['exports', 'ember-concurrency'], function (exports, _emberConcurrency) {
  exports['default'] = {
    name: 'ember-concurrency',
    initialize: function initialize() {}
  };
});
// This initializer exists only to make sure that the following
// imports happen before the app boots.
define('impact-public/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _emberDataSetupContainer, _emberData) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('impact-public/initializers/ember-stripe-service', ['exports', 'ember', 'impact-public/config/environment'], function (exports, _ember, _impactPublicConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    application.register('config:ember-stripe-service', _impactPublicConfigEnvironment['default'], { instantiate: false });
    application.inject('service:stripe', 'config', 'config:ember-stripe-service');

    if (_impactPublicConfigEnvironment['default'].LOG_STRIPE_SERVICE) {
      _ember['default'].Logger.info('StripeService: initialize');
    }

    if (!_impactPublicConfigEnvironment['default'].stripe.publishableKey) {
      throw new _ember['default'].Error('StripeService: Missing Stripe key, please set `ENV.stripe.publishableKey` in config.environment.js');
    }

    Stripe.setPublishableKey(_impactPublicConfigEnvironment['default'].stripe.publishableKey);
  }

  exports['default'] = {
    name: 'ember-stripe-stripe',
    initialize: initialize
  };
});
/* global Stripe */
define('impact-public/initializers/export-application-global', ['exports', 'ember', 'impact-public/config/environment'], function (exports, _ember, _impactPublicConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_impactPublicConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _impactPublicConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_impactPublicConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('impact-public/initializers/growl', ['exports', 'impact-public/services/growl-notifications'], function (exports, _impactPublicServicesGrowlNotifications) {
    exports['default'] = {
        name: 'growl',
        initialize: function initialize(app) {
            app.register('growl:main', _impactPublicServicesGrowlNotifications['default']);
            app.inject('route', 'growl', 'growl:main');
            app.inject('controller', 'growl', 'growl:main');
            app.inject('component', 'growl', 'growl:main');
        }
    };
});
define('impact-public/initializers/injectStore', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('impact-public/initializers/labels', ['exports', 'impact-public/services/labels'], function (exports, _impactPublicServicesLabels) {
    exports['default'] = {
        name: 'LABELS',
        initialize: function initialize(app) {
            app.register('LABELS:main', _impactPublicServicesLabels['default']);
            app.inject('route', 'LABELS', 'LABELS:main');
            app.inject('controller', 'LABELS', 'LABELS:main');
            app.inject('component', 'LABELS', 'LABELS:main');
        }
    };
});
define('impact-public/initializers/mode', ['exports', 'impact-public/services/app-mode'], function (exports, _impactPublicServicesAppMode) {
    exports['default'] = {
        name: 'mode',
        initialize: function initialize(app) {
            app.register('mode:main', _impactPublicServicesAppMode['default']);
            app.inject('route', 'mode', 'mode:main');
            app.inject('controller', 'mode', 'mode:main');
            app.inject('component', 'mode', 'mode:main');
        }
    };
});
define('impact-public/initializers/store', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('impact-public/initializers/tm-data', ['exports', 'ember', 'impact-public/utils/token', 'impact-public/config/environment'], function (exports, _ember, _impactPublicUtilsToken, _impactPublicConfigEnvironment) {

    var alreadyRun = false;

    /* global Pusher _ */
    /* jshint eqeqeq:false */

    exports['default'] = {
        name: 'tm-data-client',
        initialize: function initialize() {
            if (alreadyRun) {
                return;
            } else {
                alreadyRun = true;
            }

            _ember['default'].Filter = {
                compare: function compare(value1, value2, operator) {
                    var self = this;

                    // If the comparison value is an array, recursive check if any are true
                    if (_.isArray(value2)) {
                        return _.some(value2, function (valuex) {
                            // Recursive Call
                            return self.compare(value1, valuex, operator);
                        });
                    } else if (_.isArray(value1)) {
                        return _.some(value1, function (valuex) {
                            // Recursive Call
                            return self.compare(valuex, value2, operator);
                        });
                    } else {
                        switch (operator) {
                            case "=":
                                if (_.isNumber(value1)) {
                                    value1 = parseFloat(value1);
                                }
                                if (_.isNumber(value2)) {
                                    value2 = parseFloat(value2);
                                }
                                return value1 == value2;
                            case "!=":
                                if (_.isNumber(value1)) {
                                    value1 = parseFloat(value1);
                                }
                                if (_.isNumber(value2)) {
                                    value2 = parseFloat(value2);
                                }
                                return value1 != value2;
                            case ">":
                                return parseFloat(value1) > parseFloat(value2);
                            case "<":
                                return parseFloat(value1) < parseFloat(value2);
                            case ">=":
                                return parseFloat(value1) >= parseFloat(value2);
                            case "<=":
                                return parseFloat(value1) <= parseFloat(value2);
                            case "like":
                            case "LIKE":
                                value2 = '^' + value2.replace(/\%/g, '.*') + '$';
                                return value1 !== null && value1.search(new RegExp(value2)) !== -1;
                            case "ilike":
                            case "ILIKE":
                                value2 = '^' + value2.replace(/\%/g, '.*') + '$';
                                return value1 !== null && value1.search(new RegExp(value2, "i")) !== -1;
                            case "not like":
                            case "NOT LIKE":
                                value2 = '^' + value2.replace(/\%/g, '.*') + '$';
                                return value1 !== null && value1.search(new RegExp(value2)) === -1;
                            case "not ilike":
                            case "NOT ILIKE":
                                value2 = '^' + value2.replace(/\%/g, '.*') + '$';
                                return value1 !== null && value1.search(new RegExp(value2, "i")) === -1;
                            default:
                                console.log('Unknown Operator');
                                return false;
                        }
                    }
                },

                expandFilter: function expandFilter(filter) {
                    // Loop each field key
                    _.each(filter, function (value, key) {
                        if (_.isString(value)) {
                            filter[key] = {
                                "=": value
                            };
                        } else if (_.isArray(value)) {
                            filter[key] = {
                                "=": value
                            };
                        } else if (_.isNumber(value)) {
                            filter[key] = {
                                "=": value
                            };
                        } else if (_.isBoolean(value)) {
                            filter[key] = {
                                "=": value
                            };
                        }
                    });

                    return filter;
                },

                matches: function matches(object, filter) {
                    var self = this;

                    return _.every(filter, function (filter_value, filter_key) {
                        //console.log("filter_value, filter_key", filter_value, filter_key);

                        return _.every(filter_value, function (compare_value, operator) {
                            //console.log("compare_value, operator", compare_value, operator);

                            // Find value to test
                            var object_value = object.get(filter_key);
                            if (object_value !== undefined) {
                                // Check for match
                                var compare = self.compare(object_value, compare_value, operator);
                                //console.log("compare", compare);
                                return compare;
                            } else {
                                //console.log('Value Not Found', object);
                                return false;
                            }
                        });
                    });
                }
            };

            //This is an almost-exact copy of the deprecated Ember.DeferredMixin.
            //If there's a better way to do this, I guess we shoudl
            _ember['default'].RSVPMixin = _ember['default'].Mixin.create({
                /**
                 Add handlers to be called when the Deferred object is resolved or rejected.
                  @method then
                 @param {Function} resolve a callback function to be called when done
                 @param {Function} reject  a callback function to be called when failed
                 */
                then: function then(resolve, reject, label) {
                    var deferred, promise, entity;

                    entity = this;
                    deferred = _ember['default'].get(this, '_deferred');
                    promise = deferred.promise;

                    function fulfillmentHandler(fulfillment) {
                        if (fulfillment === promise) {
                            return resolve(entity);
                        } else {
                            return resolve(fulfillment);
                        }
                    }
                    return promise.then(resolve && fulfillmentHandler, reject, label);
                },

                /**
                 Resolve a Deferred object and call any `doneCallbacks` with the given args.
                  @method resolve
                 */
                resolve: function resolve(value) {
                    var deferred, promise;

                    deferred = _ember['default'].get(this, '_deferred');
                    promise = deferred.promise;

                    if (value === this) {
                        deferred.resolve(promise);
                    } else {
                        deferred.resolve(value);
                    }
                },

                /**
                 Reject a Deferred object and call any `failCallbacks` with the given args.
                 @method reject
                 */
                reject: function reject(value) {
                    _ember['default'].get(this, '_deferred').reject(value);
                },

                _deferred: _ember['default'].computed(function () {
                    //Ember.deprecate('Usage of Ember.DeferredMixin or Ember.Deferred is deprecated.', this._suppressDeferredDeprecation);
                    //debugger;
                    return _ember['default'].RSVP.defer('Ember: RSVPMixin - ' + this);
                })

            });
            /*
             * TM Data Socket IO Class
             */
            _ember['default'].SocketIO = {
                debug: false,
                loading: false,
                loaded: false,
                connecting: false,
                io: false,
                pusher_api: null,
                pusher_encrypted: true,
                pusher_auth_endpoint: null,
                pusher_auth_transport: 'jsonp',
                table_sync_callbacks: {},

                /*
                 * Load the pusher js file
                 */
                load: function load() {
                    if (!this.loading) {
                        var self = this;
                        self.loading = true;
                        _ember['default'].$.getScript("https://d3dy5gmtp8yhk7.cloudfront.net/2.2/pusher.min.js", function () {
                            //this function returns (data, textStatus, jqxhr)
                            self.loaded = true;
                        });
                    }
                },

                /*
                 * Connect to pusher using api key
                 */
                connect: function connect() {
                    var self = this;
                    if (!self.connecting) {
                        self.connecting = true;

                        // Connect to pusher
                        self.io = new Pusher(self.pusher_api, {
                            encrypted: self.pusher_encrypted,
                            authEndpoint: self.pusher_auth_endpoint,
                            authTransport: self.pusher_auth_transport
                        });

                        // Pusher debugging
                        if (self.debug) {
                            Pusher.log = function (message) {
                                if (window.console && window.console.log) {
                                    window.console.log(message);
                                }
                            };
                        }

                        // Bind to default tm data sync events
                        // self.listen("tm-data-sync", function(data) {
                        //     _.each(data, function(actions, table) {
                        //         // Check if table callback exists
                        //         if (self.table_sync_callbacks[table] !== undefined) {
                        //             self.table_sync_callbacks[table](actions);
                        //         }
                        //     });
                        // });
                    }
                },

                /*
                 * Listen on pusher for an event on all connected channels
                 */
                listen: function listen(ev, fn) {
                    var self = this;

                    // Defer until pusher script is loaded
                    if (!this.loaded) {
                        this.load();
                        return setTimeout(function () {
                            self.listen(ev, fn);
                        }, 1000);
                    }

                    // Connect to pusher
                    if (!this.io) {
                        this.connect();
                    }

                    // Bind to a event accross all channels
                    this.io.bind(ev, function (data) {
                        fn(data);
                    });
                },

                listen_to_table: function listen_to_table(table_name, fn) {
                    this.table_sync_callbacks[table_name] = fn;
                },

                /*
                 * Join a pusher room
                 */
                join: function join(room_id) {
                    var self = this;

                    // Defer until pusher script is loaded
                    if (!this.loaded) {
                        this.load();
                        return setTimeout(function () {
                            self.join(room_id);
                        }, 1000);
                    }

                    // Connect to pusher
                    if (!this.io) {
                        this.connect();
                    }

                    // Joining channel
                    return this.io.subscribe(String(room_id));
                }
            };

            function mustImplement(message) {
                var fn = function fn() {
                    var className = this.constructor.toString();

                    throw new Error(message.replace('{{className}}', className));
                };
                fn.isUnimplemented = true;
                return fn;
            }

            _ember['default'].Adapter = _ember['default'].Object.extend({
                find: mustImplement('{{className}} must implement find'),
                findQuery: mustImplement('{{className}} must implement findQuery'),
                findAll: mustImplement('{{className}} must implement findAll'),
                findAllById: mustImplement('{{className}} must implement findAllById'),
                createRecord: mustImplement('{{className}} must implement createRecord'),
                saveRecord: mustImplement('{{className}} must implement saveRecord'),
                updateRecord: mustImplement('{{className}} must implement updateRecord'),
                deleteRecord: mustImplement('{{className}} must implement deleteRecord')
            });

            _ember['default'].RestAdapterBatch = _ember['default'].Object.create({
                api_endpoint: '',
                batch_queue: null,
                batch_queue_count: 0,
                auth: function auth(params) {
                    params._token = _impactPublicUtilsToken['default'].get();
                    return params;
                },
                //Get called when a query fails.
                //returns json
                queryFailed: function queryFailed() {
                    //For Example:
                    // if (json.error === "The API key they sent doesn't match any of ours.") {
                    //     App.get('Router.router').transitionTo('frame.logout');
                    // }
                },
                getBatch: function getBatch() {
                    if (!this.batch_queue) {
                        this.batch_queue = {};
                    }

                    return this.batch_queue;
                },
                resetBatch: function resetBatch() {
                    //console.log('resetBatch');

                    // Reset queue
                    this.batch_queue = {};
                },
                processBatch: function processBatch() {
                    // console.log('processBatch');
                    var self = this;
                    var queue = this.getBatch();
                    this.resetBatch();

                    //console.log("queue", queue);

                    var batch_call = this.auth({});
                    _.each(queue, function (value, key) {
                        var query = _ember['default'].$.param(value.params);
                        batch_call[key] = value.url + (query ? '?' + query : '');
                    });

                    //console.log("batch_call", batch_call);

                    // Call
                    var url = this.get('api_endpoint') + '/api/multifetch';
                    _ember['default'].$.post(url, batch_call, function (json) {
                        //console.log("json", json);
                        if (json.error && json.code === 500) {
                            console.log('Problem reading query from server: ' + json.error);
                            self.queryFailed(json);
                        } else {
                            _.each(json, function (value, key) {
                                if (queue[key]) {
                                    //console.log('Running Callback');
                                    queue[key].callback(value);
                                }
                            });
                        }
                    }, 'json');
                },
                addToBatch: function addToBatch(url, params, callback) {
                    console.log('addToBatch', url);
                    //debugger;
                    var queue = this.getBatch();
                    var queue_id = this.batch_queue_count++;
                    queue[queue_id] = {
                        url: url,
                        params: params,
                        callback: callback
                    };
                    _ember['default'].run.debounce(this, 'processBatch', 10);
                }
            });

            _ember['default'].RestAdapter = _ember['default'].Adapter.extend({
                api_endpoint: '',
                auth: function auth(params) {
                    params._token = _impactPublicUtilsToken['default'].get();
                    return params;
                },
                //Get called when a query fails.
                //returns json
                queryFailed: function queryFailed() {
                    //For Example:
                    // if (json.error === "The API key they sent doesn't match any of ours.") {
                    //     App.get('Router.router').transitionTo('frame.logout');
                    // }
                },

                ajax: function ajax(url, params, callback) {
                    //console.log('Ajax');
                    return _ember['default'].RestAdapterBatch.addToBatch(url, params, callback);
                },

                find: function find(record, id) {
                    //console.log("adapter find", id);
                    var self = this;

                    // Url
                    var url = '/' + _ember['default'].get(record.constructor, 'table');
                    url += '/' + id;

                    // IE Fix
                    //url += '?callback=?';

                    // Params
                    var params = {};

                    // Auth
                    //params = this.auth(params);

                    // Call
                    // Ember.$.getJSON(url, params, function(json) {
                    //     if (json.result !== null && json.result !== undefined && json.result[0] !== undefined) {
                    //         record.load(json.result[0]);
                    //     } else {
                    //         console.log('Problem reading record from server: ' + json.error);
                    //         self.queryFailed(json);
                    //     }
                    // });

                    this.ajax(url, params, function (json) {
                        if (json.result !== null && json.result !== undefined && json.result[0] !== undefined) {
                            record.load(json.result[0]);
                        } else {
                            console.log('Problem reading record from server: ' + json.error);
                            self.queryFailed(json);
                        }
                    });
                },
                findAll: function findAll(klass, records) {
                    //console.log("adapter findAll", klass);
                    var self = this;

                    // Url
                    var url = '/' + _ember['default'].get(klass, 'table');

                    // IE Fix
                    //url += '?callback=?';

                    // Params
                    var params = {};

                    // Auth
                    //params = this.auth(params);

                    // Call
                    // Ember.$.getJSON(url, params, function(json) {
                    //     if (json.result !== null && json.result !== undefined) {
                    //         klass.load(json.result, records);
                    //     } else {
                    //         console.log('Problem reading all from server: ' + json.error);
                    //         self.queryFailed(json);
                    //     }
                    // });

                    this.ajax(url, params, function (json) {
                        if (json.result !== null && json.result !== undefined) {
                            klass.load(json.result, records);
                        } else {
                            console.log('Problem reading all from server: ' + json.error);
                            self.queryFailed(json);
                        }
                    });
                },
                findAllById: function findAllById(klass, records) {
                    // console.log("adapter findAllById", records);
                    var self = this;

                    // Url
                    var url = '/' + _ember['default'].get(klass, 'table');

                    // IE Fix
                    //url += '?callback=?';

                    // Params
                    var params = {};
                    var ids = _.keys(records);

                    params.filter = JSON.stringify({
                        id: ids
                    });

                    // Auth
                    //params = this.auth(params);

                    // Call
                    // Ember.$.getJSON(url, params, function(json) {
                    //     console.log("json", json);
                    //     if (json.result !== null && json.result !== undefined) {
                    //         //klass.load(json.result, records);
                    //         _.each(json.result, function(record) {
                    //             if (records[record.id]) {
                    //                 records[record.id].load(record);
                    //             }
                    //         });
                    //     } else {
                    //         console.log('Problem reading query from server: ' + json.error);
                    //         self.queryFailed(json);
                    //     }
                    // });

                    this.ajax(url, params, function (json) {
                        //console.log("json", json);
                        if (json.result !== null && json.result !== undefined) {
                            //klass.load(json.result, records);
                            _.each(json.result, function (record) {
                                if (records[record.id]) {
                                    records[record.id].load(record);
                                }
                            });
                        } else {
                            console.log('Problem reading query from server: ' + json.error);
                            self.queryFailed(json);
                        }
                    });
                },
                findQuery: function findQuery(klass, records, filter, options) {
                    //console.log("adapter findQuery", records, params, options);
                    var self = this;
                    // Url
                    var url = '/' + _ember['default'].get(klass, 'table');

                    // IE Fix
                    //url += '?callback=?';

                    // Params
                    var params = {};

                    // Filtering
                    if (filter) {
                        params.filter = JSON.stringify(filter);
                    }

                    // Options - Sort
                    if (options && options.sort) {
                        params.sort = JSON.stringify(options.sort);
                    }

                    // Options - Limit
                    if (options && options.limit) {
                        params.limit = options.limit;
                    }

                    // Options - Offset
                    if (options && options.offset) {
                        params.offset = options.offset;
                    }

                    // Auth
                    //params = this.auth(params);

                    // Call
                    // Ember.$.getJSON(url, params, function(json) {
                    //     if (json.result !== null && json.result !== undefined) {
                    //         klass.load(json.result, records);
                    //     } else {
                    //         console.log('Problem reading query from server: ' + json.error);
                    //         self.queryFailed(json);
                    //     }
                    // });

                    this.ajax(url, params, function (json) {
                        if (json.result !== null && json.result !== undefined) {
                            klass.load(json.result, records);
                        } else {
                            console.log('Problem reading query from server: ' + JSON.stringify(json.error));
                            self.queryFailed(json);
                        }
                    });
                },
                createRecord: function createRecord(record) {
                    //console.log("adapter createRecord", record);

                    // Url
                    var url = this.get('api_endpoint');
                    url += '/' + _ember['default'].get(record.constructor, 'table');

                    // IE Fix
                    url += '?callback=?';

                    // Params
                    var data = record.getDirty();

                    // Method Override
                    data._method = 'POST';

                    // Auth
                    data = this.auth(data);

                    return _ember['default'].$.getJSON(url, data, function (json) {
                        if (json.result !== undefined && json.result !== null && json.result[0] !== undefined) {
                            record.load(json.result[0]);
                        } else {
                            console.log('There was a problem saving to the server.');
                        }
                    });
                },
                updateRecord: function updateRecord(id, record) {
                    //console.log("adapter updateRecord", record);

                    // Url
                    var url = this.get('api_endpoint');
                    url += '/' + _ember['default'].get(record.constructor, 'table');
                    url += '/' + id;

                    // IE Fix
                    url += '?callback=?';

                    // Params
                    var data = record.getDirty();

                    // Method Override
                    data._method = 'PUT';

                    // Auth
                    data = this.auth(data);

                    return _ember['default'].$.getJSON(url, data, function (json) {
                        if (json.result !== undefined && json.result !== null && json.result[0] !== undefined) {
                            record.load(json.result[0]);
                        } else {
                            console.log('There was a problem updating to the server.');
                        }
                    });
                },
                deleteRecord: function deleteRecord(id, record) {
                    //console.log("adapter deleteRecord", id, record);

                    // Url
                    var url = this.get('api_endpoint');
                    url += '/' + _ember['default'].get(record.constructor, 'table');
                    url += '/' + id;

                    // IE Fix
                    url += '?callback=?';

                    // Params
                    var data = {};

                    // Method Override
                    data._method = 'DELETE';

                    // Auths
                    data = this.auth(data);

                    return _ember['default'].$.getJSON(url, data, function (json) {
                        if (json.result !== undefined && json.result !== null && json.result[0] !== undefined) {
                            // Nothing
                        } else {
                                console.log('There was a problem deleting from the server.');
                            }
                    });
                }
            });

            /*
             * Base class for objects
             */
            _ember['default'].Model = _ember['default'].Object.extend({});

            _ember['default'].Model.reopen(_ember['default'].RSVPMixin, {
                // Saved to server
                _persisted: false,
                // Copy of object on server
                _clean: null,
                isLoaded: false,
                isSaving: false,
                isLoading: _ember['default'].computed.not('isLoaded'),
                isPersisted: _ember['default'].computed.bool('_persisted'),
                // Initialize
                init: function init() {
                    this._super();
                    //When updating records, we will run init again to trigger some models' computed properties.
                    //We don't want to wipe out _clean in those cases.
                    if (!this.get('isLoaded')) {
                        this.set('_clean', {});
                    }
                },
                observeLoaded: _ember['default'].observer('isLoaded', function () {
                    // Once loaded, resolve promise
                    if (this.get('isLoaded')) {
                        this.resolve(this);
                    }
                }),
                // Return object in plain json object
                getJson: function getJson() {
                    var v,
                        ret = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key)) {
                            v = this[key];
                            // Ignore private parameters
                            if (key.charAt(0) === '_') {
                                continue;
                            }
                            // Ignore toString function
                            if (v === 'toString') {
                                continue;
                            }
                            // Ignore Functions
                            if (_ember['default'].typeOf(v) === 'function') {
                                continue;
                            }
                            // Ignore Undefined - Computed Properties
                            if (_ember['default'].typeOf(v) === 'undefined') {
                                continue;
                            }
                            // Ignore Instances - Other Classes
                            if (_ember['default'].typeOf(v) === 'instance') {
                                continue;
                            }
                            ret.push(key);
                        }
                    }

                    return this.getProperties(ret);
                },
                // Returns an object with the changed fields.
                getDirty: function getDirty() {
                    var data = this.getJson();
                    var clean = this.get('_clean');

                    // Find changed data
                    for (var key in data) {
                        // Check if exists and if they are equal
                        if (clean !== null && clean[key] !== undefined && data[key] === clean[key]) {
                            delete data[key];
                        }
                    }

                    return data;
                },
                // Returns true/false depending on if there are unsave changes
                isClean: function isClean() {
                    var dirty = this.getDirty();
                    return _.isEmpty(dirty);
                },
                //Returns whenther or not the values that are stored in the database have actually changed.
                isReallyDirty: function isReallyDirty() {
                    var self = this;
                    var isReallyDirty = false;

                    //If there is no _clean object, this is a newly create record that hasn't been saved yet.
                    //We should consider it dirty.
                    if (_.isEmpty(this.get('_clean'))) {
                        return true;
                    }

                    _.each(this.get('_clean'), function (value, key) {

                        if (_ember['default'].compare(value, self.get(key)) !== 0) {
                            isReallyDirty = true;
                        }
                    });
                    return isReallyDirty;
                },
                load: function load(json) {
                    // Update
                    //var self = this;
                    this.set('_clean', json);
                    this.setProperties(json);
                    //this.beginPropertyChanges();
                    // _.each(json, function(value, key) {
                    //     self.set(key, value);
                    // });
                    // this.endPropertyChanges();
                    this.set('_persisted', true);
                    this.set('isLoaded', true);

                    // Trigger update
                    this.constructor.trigger('didUpdateRecord', this, this.get('id'));
                },
                revertRecord: function revertRecord() {
                    if (this.get('_persisted') === false) {
                        // Do nothing. Object is not in store.
                    } else {
                            this.setProperties(this.get('_clean'));
                        }
                },
                deleteRecord: function deleteRecord() {
                    var dfr = _ember['default'].RSVP.defer();
                    var record = this;
                    var id = this.get('id');
                    var adapter = this.constructor.get_adapter();

                    // Remove from hash
                    this.constructor._findAndRemoveFromCacheById(id);

                    // Remove from remote
                    adapter.deleteRecord(id, this).then(function (response) {
                        if (!response.error) {
                            dfr.resolve({
                                record: record,
                                response: response
                            });
                        } else {
                            dfr.reject(response.error);
                        }
                    });

                    return dfr.promise;
                },
                saveRecord: function saveRecord() {
                    var dfr = _ember['default'].RSVP.defer();
                    var record = this;
                    var id = record.get('id');
                    var adapter = record.constructor.get_adapter();

                    record.set('isSaving', true);

                    if (id) {
                        // Update
                        adapter.updateRecord(id, record).then(function (response) {
                            record.set('isSaving', false);
                            if (!response.error) {
                                dfr.resolve({
                                    record: record,
                                    response: response
                                });
                            } else {
                                dfr.reject(response.error);
                            }
                        });
                    } else {
                        // Create
                        adapter.createRecord(record).then(function (response) {
                            record.set('isSaving', false);
                            if (!response.error) {
                                dfr.resolve({
                                    record: record,
                                    response: response
                                });
                            } else {
                                dfr.reject(response.error);
                            }
                        });
                    }

                    return dfr.promise;
                }
            });

            /*
             * Proxys to a real model until it's saved
             */

            _ember['default'].ModelProxy = _ember['default'].ObjectProxy.extend({
                // If a value is set, then this has been inserted in the store.
                _uuid: false,
                // Saved to server
                _persisted: _ember['default'].computed.alias('content._persisted'),
                _clean: _ember['default'].computed.alias('content._clean'),
                isLoaded: _ember['default'].computed.alias('content.isLoaded'),
                isSaving: _ember['default'].computed.alias('content.isSaving'),
                isLoading: _ember['default'].computed.alias('content.isLoading'),
                isPersisted: _ember['default'].computed.alias('content.isPersisted'),
                // Initialize
                init: function init() {
                    this._super();
                    this.constructor = this.get('content').constructor;
                },
                getJson: function getJson() {
                    return this.get('content').getJson();
                },
                getDirty: function getDirty() {
                    return this.get('content').getDirty();
                },
                isClean: function isClean() {
                    return this.get('content').isClean();
                },
                isReallyDirty: function isReallyDirty() {
                    return this.get('content').isReallyDirty();
                },
                load: function load(json) {
                    var proxy_record = this.get('content');

                    // Remove proxy record from store
                    var uuid = this.get("_uuid");
                    if (uuid) {
                        proxy_record.constructor._findAndRemoveFromCacheById(uuid);
                    }

                    // Get new record
                    var record = proxy_record.constructor._findOrCreateInCacheById(json.id, json);

                    // Override proxy
                    this.set('content', record);
                    this.set('uuid', false);
                },
                revertRecord: function revertRecord() {
                    var record = this.get('content');

                    if (record.get('_persisted')) {
                        return record.revertRecord();
                    } else if (this.get('_uuid')) {
                        var uuid = this.get("_uuid");
                        record.constructor._findAndRemoveFromCacheById(uuid);
                    }
                },
                deleteRecord: function deleteRecord() {
                    var record = this.get('content');

                    if (record.get('_persisted')) {
                        // Already saved
                        return record.deleteRecord();
                    } else if (this.get('_uuid')) {
                        var uuid = this.get("_uuid");
                        record.constructor._findAndRemoveFromCacheById(uuid);
                    }
                },
                saveRecord: function saveRecord() {
                    var self = this;
                    var record = this.get('content');
                    if (self.get('_persisted')) {
                        // Already Saved
                        return record.saveRecord();
                    } else {
                        var dfr = _ember['default'].RSVP.defer();
                        var adapter = self.constructor.get_adapter();

                        adapter.createRecord(self).then(function (response) {
                            if (!response.error) {
                                dfr.resolve({
                                    record: self,
                                    response: response
                                });
                            } else {
                                dfr.reject(response.error);
                            }
                        });

                        return dfr.promise;
                    }
                }
            });

            _ember['default'].Model.reopenClass(_ember['default'].Evented, {
                hash: false,
                adapter: false,
                table: false,
                enable_sockets: true,
                find_by_id_queue: null,
                get_hash: function get_hash() {
                    if (!this.hash) {
                        this.hash = _ember['default'].Map.create();
                    }
                    return this.hash;
                },
                get_records: function get_records() {
                    if (!this.records) {
                        this.records = _ember['default'].Map.create();
                    }
                    return this.records;
                },
                push_records: function push_records(records, recordId) {
                    if (recordId) {
                        var oldrecords = this.get_records();
                        var old = oldrecords.get(recordId);
                        if (old) {
                            old.destroy();
                            console.log("Destroyed THE OLD RECORD: " + records.klass.toString());
                        }
                        oldrecords.set(recordId, records);
                    }
                },
                // Reset the contents of the hash
                reset: function reset() {
                    this.hash = _ember['default'].Map.create();
                },
                get_adapter: function get_adapter() {
                    if (!this.adapter) {
                        this.adapter = _ember['default'].RestAdapter.create();

                        // Setup sockets
                        if (this.enable_sockets) {
                            this.setup_sockets();
                        }
                    }
                    return this.adapter;
                },
                setup_sockets: function setup_sockets() {
                    var self = this;
                    var table = this.table;
                    _ember['default'].SocketIO.listen_to_table(table, function (data) {
                        //console.log(table, data);

                        // Delete action
                        if (data['delete'] !== undefined) {
                            _.each(data['delete'], function (id) {
                                //console.log("delete " + table + ': ' + id);
                                self._findAndRemoveFromCacheById(id);
                            });
                        }
                        // Create
                        var ids = [];

                        if (data.create !== undefined) {
                            ids = ids.concat(data.create);
                        }

                        if (data.update !== undefined) {
                            ids = ids.concat(data.update);
                        }
                        //console.log("ids", ids);

                        if (ids.length > 0) {
                            // Unique array of ids
                            ids = _.uniq(ids);
                            _.each(ids, function (id) {
                                //console.log("load " + table + ': ' + id);
                                self._findOrCreateInCacheById(id, false, true);
                            });
                        }
                    });
                },
                // Universal find method
                find: function find(parameter, options, recordId) {
                    var type = _ember['default'].typeOf(parameter);
                    if (type === "string" || type === "number") {
                        return this._findOrCreateInCacheById(parameter);
                    } else if (type === "object") {
                        return this._findQueryAndReloadAll(parameter, options, recordId);
                    } else {
                        return this._findAndReloadAll(recordId);
                    }
                },
                // Finds a query in the local cache
                findInCache: function findInCache(parameter, options, recordId) {
                    var type = _ember['default'].typeOf(parameter);
                    if (type === "string" || type === "number") {
                        return this._findOrCreateInCacheById(parameter, false, false);
                    } else if (type === "object") {
                        return this._findQueryFromCache(parameter, options, recordId);
                    } else {
                        return this._findFromCacheAll(recordId);
                    }
                },
                // Finds the first item that matches the query in cache and will remote load if not found
                findFirst: function findFirst(parameter, options, recordId) {
                    var cache = this.findFirstInCache(_ember['default'].$.extend(true, {}, parameter), options, recordId);
                    if (cache) {
                        //console.log('Found in cache');
                        return cache;
                    } else {
                        //console.log("Not in cache", parameter);
                        var record = this.createRecord(parameter, true);

                        // Load remote
                        this.find(parameter, options, recordId).then(function (records) {
                            var first_remote_record = records.get('firstObject');

                            if (first_remote_record) {
                                //console.log('Loaded first from api');
                                record.load(first_remote_record.getJson());
                            } else {
                                //console.log('Unable to find first on api');
                            }
                        });

                        return record;
                    }
                },
                // Finds the first item in the cache that matches the query
                findFirstInCache: function findFirstInCache(parameter, options, recordId) {
                    return this._findQueryFromCache(parameter, options, recordId).flush().get('firstObject');
                },
                // Load json records into hash
                load: function load(json, records) {
                    var self = this;
                    _.each(json, function (item) {
                        if (item.id !== undefined) {
                            // Save in save
                            self._findOrCreateInCacheById(item.id, item);
                        } else {
                            console.log('Unknown json item', item);
                        }
                    });

                    if (json.length === 0) {
                        //Before this line was added,
                        //'isLoaded' was not being set if there were zero records returned on a query.
                        records.set('isLoaded', true);
                    }

                    // Update record array
                    if (records) {
                        //records.set('isLoaded', true);
                    }
                },
                createRecord: function createRecord(json, insert) {
                    var record;

                    // Load data
                    if (json) {
                        record = this.create(json);
                    } else {
                        record = this.create();
                    }

                    // Create proxy to record
                    var proxy = _ember['default'].ModelProxy.create({
                        content: record
                    });

                    // Insert proxy object in hash
                    if (insert) {
                        var uuid = this._uuid();
                        proxy.set('_uuid', uuid);

                        this._addObjectToCacheById(uuid, proxy);
                    }

                    return proxy;
                },
                _uuid: function _uuid() {
                    // Source: https://gist.github.com/jed/982883
                    function b(a) {
                        return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
                    }
                    return b();
                },
                _isNumeric: function _isNumeric(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                },
                _getIdsQueue: function _getIdsQueue() {
                    if (!this.find_by_id_queue) {
                        this.find_by_id_queue = {};
                    }

                    return this.find_by_id_queue;
                },
                _resetIdsQueue: function _resetIdsQueue() {
                    //console.log('_resetIdsQueue');

                    // Reset queue
                    this.find_by_id_queue = {};
                },
                _processIdsQueue: function _processIdsQueue() {
                    //console.log('_processIdsQueue');
                    var queue = this._getIdsQueue();
                    this._resetIdsQueue();

                    // Load adapter and issue call
                    var adapter = this.get_adapter();
                    adapter.findAllById(this, queue);

                    //console.log("queue", _.keys(queue));
                },
                _addIdToQueue: function _addIdToQueue(id, record) {
                    // console.log('_addIdToQueue', id);
                    var queue = this._getIdsQueue();
                    queue[id] = record;
                    _ember['default'].run.debounce(this, '_processIdsQueue', 10);
                },
                _findOrCreateInCacheById: function _findOrCreateInCacheById(id, json, reload) {
                    var record;
                    var hash = this.get_hash();

                    // Cast string ids to int
                    if (typeof id === "string" && this._isNumeric(id)) {
                        id = parseFloat(id);
                    }

                    // Setup reload
                    if (reload === undefined) {
                        reload = true;
                    }

                    if (hash.has(id)) {
                        //console.log('Returning from cache', id);

                        // Find existing record
                        record = hash.get(id);
                    } else {
                        //console.log('Not in cache', id);

                        // Create new record
                        record = this.create({
                            id: id
                        });

                        // Hash
                        hash.set(id, record);
                        this.trigger('didCreateRecord', record, id);
                    }

                    // Load json locally
                    if (json) {
                        record.load(json);
                    }

                    // Load json remotely
                    if (!json && reload) {
                        this._addIdToQueue(id, record);
                    }

                    return record;
                },
                _addObjectToCacheById: function _addObjectToCacheById(id, record) {
                    var hash = this.get_hash();

                    // Cast string ids to int
                    if (typeof id === "string" && this._isNumeric(id)) {
                        id = parseFloat(id);
                    }

                    if (!hash.has(id)) {
                        // Hash
                        hash.set(id, record);
                        this.trigger('didCreateRecord', record, id);
                    } else {
                        console.log('Error adding new record to cache, it has already been added.');
                    }
                },
                _findAndRemoveFromCacheById: function _findAndRemoveFromCacheById(id) {
                    var record;
                    var hash = this.get_hash();

                    if (hash.has(id)) {
                        // Find existing record
                        record = hash.get(id);
                        hash['delete'](id);
                        this.trigger('didDeleteRecord', record, id);
                    }
                },
                // Find and reload all
                _findAndReloadAll: function _findAndReloadAll(recordId) {
                    // Return empty RecordArray
                    var records = _ember['default'].RecordArray.create({
                        klass: this,
                        content: _ember['default'].A([]),
                        hash: this.get_hash()
                    });
                    this.push_records(records, recordId);

                    // Preload existing hash records
                    //records.preload_hash();

                    var adapter = this.get_adapter();

                    // Load Records
                    adapter.findAll(this, records);
                    return records;
                },
                // Find query and reload all
                _findQueryAndReloadAll: function _findQueryAndReloadAll(filter_json, options, recordId) {
                    var self = this;

                    // Return empty RecordArray
                    var records = _ember['default'].RecordArray.create({
                        klass: self,
                        content: _ember['default'].A([]),
                        filter_json: filter_json,
                        options: options,
                        hash: this.get_hash()
                    });

                    this.push_records(records, recordId);

                    // Preload existing hash records
                    //records.preload_hash();

                    var adapter = this.get_adapter();

                    // Load Records
                    adapter.findQuery(this, records, filter_json, options);

                    return records;
                },
                // Find all in cache
                _findFromCacheAll: function _findFromCacheAll(recordId) {
                    // Return empty RecordArray
                    var records = _ember['default'].RecordArray.create({
                        klass: this,
                        content: _ember['default'].A([]),
                        hash: this.get_hash()
                    });

                    this.push_records(records, recordId);

                    // Preload existing hash records
                    records.preload_hash();

                    //We're calling debounceUpdates once here to make sure that 'isLoaded' will get set to true in the event
                    //that the query doesn't return any records.  Otherwise, it never get's set to true and the promises never resolves.
                    records.debounceUpdate();

                    // Loaded
                    //records.set('isLoaded', true);

                    return records;
                },
                // Find query in cache
                _findQueryFromCache: function _findQueryFromCache(filter_json, options, recordId) {
                    var self = this;

                    // Return empty RecordArray
                    var records = _ember['default'].RecordArray.create({
                        klass: self,
                        content: _ember['default'].A([]),
                        filter_json: filter_json,
                        options: options,
                        hash: this.get_hash()
                    });

                    this.push_records(records, recordId);

                    // Preload existing hash records
                    records.preload_hash();

                    //We're calling debounceUpdates once here to make sure that 'isLoaded' will get set to true in the event
                    //that the query doesn't return any records.  Otherwise, it never get's set to true and the promises never resolves.
                    records.debounceUpdate();

                    // Loaded
                    //records.set('isLoaded', true);

                    return records;
                },

                _createNewRecordArray: function _createNewRecordArray(options) {
                    var defaultOptions = {
                        klass: this,
                        content: _ember['default'].A([]),
                        hash: this.get_hash()
                    };

                    var finalOptions = _.extend(defaultOptions, options);

                    var recordArray = _ember['default'].RecordArray.create(finalOptions);

                    return recordArray;
                }
            });

            /*
             * Store filtered / un - filtered result sets from the hash
             */
            _ember['default'].RecordArray = _ember['default'].ArrayProxy.extend(_ember['default'].RSVPMixin, _ember['default'].Evented, {
                klass: null,
                hash: null,
                debouncer: null,
                filter_json: false,
                options: false,
                isLoaded: false,
                isLoading: _ember['default'].computed.not('isLoaded'),
                ids: _ember['default'].A('content', 'id'),
                _uuids: _ember['default'].A('content', '_uuid'),
                init: function init() {
                    this._super();

                    this.set('recordInsertQueue', {});
                    this.set('recordUpdateQueue', {});

                    this.set('debounceInsert', _.debounce(this.pushRecords, 100));
                    this.set('debounceUpdate', _.debounce(this.updateRecords, 100));

                    //Setup up listeners
                    this.klass.on('didCreateRecord', this, this.insertCheck);
                    this.klass.on('didUpdateRecord', this, this.insertCheck);
                    this.klass.on('didDeleteRecord', this, this.deleteCheck);
                },
                willDestroy: function willDestroy() {
                    this._super();
                    this.klass.off('didCreateRecord', this, this.insertCheck);
                    this.klass.off('didUpdateRecord', this, this.insertCheck);
                    this.klass.off('didDeleteRecord', this, this.deleteCheck);
                    // console.log("DESTROYING " + this.klass.toString());
                },
                preload_hash: function preload_hash() {
                    // Insert current records
                    this.hash.forEach(this.insertCheck, this);
                },
                observeLoaded: _ember['default'].observer('isLoaded', function () {
                    // Once loaded, resolve promise
                    if (this.get('isLoaded')) {
                        this.resolve(this);
                    }
                }),
                hasRecords: _ember['default'].computed(function () {
                    if (this.get('content.length') > 0) {
                        return true;
                    } else {
                        return false;
                    }
                }).property('content.[]', 'isLoaded'),
                filterObject: _ember['default'].computed(function () {
                    // Caches the expanded filter object
                    var filter_json = this.get('filter_json');
                    if (filter_json) {
                        return _ember['default'].Filter.expandFilter(filter_json);
                    } else {
                        return false;
                    }
                }).property('filter'),
                // Flushes any delayed inserts
                flush: function flush() {
                    _ember['default'].run.cancel(this.debouncer);
                    this.pushRecords();
                    return this;
                },
                insertCheck: function insertCheck(record, id) {
                    // Check Filters
                    var filter = this.get('filterObject');
                    if (filter) {
                        var passes = _ember['default'].Filter.matches(record, filter);

                        if (passes) {
                            // Insert matching record
                            this.insertRecord(record, id);
                        } else {
                            // Remove non-matching object
                            if (this.includes(record)) {
                                this.removeObject(record);
                            }
                        }
                    } else {
                        // Insert all records
                        this.insertRecord(record, id);
                    }
                },
                insertRecord: function insertRecord(record, id) {
                    var queue;
                    var record_id = id;
                    // Insert new record
                    if (!this.includes(record) && (_ember['default'].$.inArray(record.get('id'), this.get('ids')) === -1 || record.get('_uuid'))) {
                        queue = this.get('recordInsertQueue');
                        queue[record_id] = record;
                        //this.debouncer = Ember.run.debounce(this, 'pushRecords', 100);
                        this.debounceInsert();

                        //console.log('queueing insert ' + this.klass.toString());
                    } else {
                            // Updated
                            queue = this.get('recordUpdateQueue');
                            queue[record_id] = record;
                            //Ember.run.debounce(this, 'updateRecords', 100);
                            this.debounceUpdate();
                        }
                },

                pushRecords: function pushRecords() {
                    if (!(this.isDestroyed || this.isDestroying)) {
                        //var self = this;
                        var queue = _.toArray(this.get('recordInsertQueue'));
                        var left = queue.length; //How many object we should push given the limit set, and howmany already exist.

                        //console.log('inserting ' + this.klass.toString() + " " + queue.length);

                        // Check limit
                        var limit = this.get('options.limit');
                        if (limit) {
                            var length = this.get('length');
                            if (length >= limit) {
                                // Array is full
                                return false;
                            }
                            left = limit - length;
                        }

                        this.pushObjects(queue.slice(0, left));

                        this.set('isLoaded', true);

                        //empty the queue
                        this.set('recordInsertQueue', {});
                    }
                },
                updateRecords: function updateRecords() {
                    // this.set('updateCount', 0);
                    if (!(this.isDestroyed || this.isDestroying)) {

                        var queue = _.flatten(_.toArray(this.get('recordUpdateQueue')));
                        this.set('recordUpdateQueue', {});

                        //console.log('updating ' + this.klass.toString() + " " + queue.length);

                        _.each(queue, function (record) {
                            //WHY ARE WE DOING THIS HERE????
                            //self.trigger('didUpdateRecord', record.get('id'), record);

                            record.set('isLoaded', true);
                            //computed properties that rely on database calls will need init() to be called in order to properly update.
                            record.init();
                        });

                        this.set('isLoaded', true);
                    }
                },
                deleteCheck: function deleteCheck(record) {
                    //pass id if needed
                    // Remove deleted object
                    if (this.includes(record)) {
                        this.removeObject(record);
                        //this.trigger('didDeleteRecord', id, record);
                    }
                }
            });

            _ember['default'].RestAdapter.reopen({
                api_endpoint: _impactPublicConfigEnvironment['default'].api.url
            });

            _ember['default'].RestAdapterBatch.set('api_endpoint', _impactPublicConfigEnvironment['default'].api.url);

            _ember['default'].SocketIO.pusher_api = _impactPublicConfigEnvironment['default'].pusherKey;
            _ember['default'].SocketIO.pusher_auth_endpoint = _impactPublicConfigEnvironment['default'].api.url + '/pusher/auth';
        }
    };
});
define('impact-public/initializers/transforms', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('impact-public/initializers/truth-helpers', ['exports', 'ember', 'ember-truth-helpers/utils/register-helper', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/is-array', 'ember-truth-helpers/helpers/not-equal', 'ember-truth-helpers/helpers/gt', 'ember-truth-helpers/helpers/gte', 'ember-truth-helpers/helpers/lt', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersUtilsRegisterHelper, _emberTruthHelpersHelpersAnd, _emberTruthHelpersHelpersOr, _emberTruthHelpersHelpersEqual, _emberTruthHelpersHelpersNot, _emberTruthHelpersHelpersIsArray, _emberTruthHelpersHelpersNotEqual, _emberTruthHelpersHelpersGt, _emberTruthHelpersHelpersGte, _emberTruthHelpersHelpersLt, _emberTruthHelpersHelpersLte) {
  exports.initialize = initialize;

  function initialize() /* container, application */{

    // Do not register helpers from Ember 1.13 onwards, starting from 1.13 they
    // will be auto-discovered.
    if (_ember['default'].Helper) {
      return;
    }

    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('and', _emberTruthHelpersHelpersAnd.andHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('or', _emberTruthHelpersHelpersOr.orHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('eq', _emberTruthHelpersHelpersEqual.equalHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not', _emberTruthHelpersHelpersNot.notHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('is-array', _emberTruthHelpersHelpersIsArray.isArrayHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not-eq', _emberTruthHelpersHelpersNotEqual.notEqualHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gt', _emberTruthHelpersHelpersGt.gtHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gte', _emberTruthHelpersHelpersGte.gteHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lt', _emberTruthHelpersHelpersLt.ltHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lte', _emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = {
    name: 'truth-helpers',
    initialize: initialize
  };
});
define('impact-public/instance-initializers/browser-update', ['exports', 'ember-cli-browser-update/instance-initializers/browser-update'], function (exports, _emberCliBrowserUpdateInstanceInitializersBrowserUpdate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliBrowserUpdateInstanceInitializersBrowserUpdate['default'];
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function get() {
      return _emberCliBrowserUpdateInstanceInitializersBrowserUpdate.initialize;
    }
  });
});
define("impact-public/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _emberDataInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataInstanceInitializersInitializeStoreService["default"]
  };
});
define('impact-public/models/donation-suggestions', ['exports', 'ember'], function (exports, _ember) {

  var DonationSuggestions = _ember['default'].Model.extend({});

  DonationSuggestions.table = 'organization_donation_suggestions';

  exports['default'] = DonationSuggestions;
});
define('impact-public/models/donations-local', ['exports', 'ember'], function (exports, _ember) {

    var DonationsLocal = _ember['default'].Model.extend({
        lendAHandId: 170,

        save: function save() {
            var newDonations = [];
            var donations = _ember['default'].$.jStorage.get('donations');
            var isNewDonation = false;

            if (this.get('id')) {
                var matchDonation = _.findWhere(donations, {
                    id: this.get('id')
                });

                if (matchDonation) {
                    isNewDonation = false;
                    newDonations = _.reject(donations, function (donation) {
                        return donation.id === matchDonation.id;
                    });
                } else if (donations && donations.length > 0) {
                    //This donation is not in local storage yet
                    isNewDonation = true;
                    newDonations = donations;
                }
            } else {
                if (donations && donations.length > 0) {
                    newDonations = donations;
                    var ids = _.pluck(donations, 'id');
                    this.set('id', _.max(ids) + 1);
                } else {
                    this.set('id', 1);
                }
                isNewDonation = true;
            }

            //There is a specific edge case for Lend a Hand donations made with a campaign ID
            //There is specific receipt language related to Lend a Hand that does not apply to any other
            //donation so we cannot allow people to add more donations to their cart when this happens.
            //So we need to check for this edge case and then show the user an error if this happens
            if (isNewDonation) {
                if (donations && donations.length > 0 && this.get('nonprofit_id') === this.get('lendAHandId') && this.get('campaign_id')) {
                    this.lendAHandException('charity_in_cart');
                    return 'lendAHandException';
                }

                var lendAHandDonationsWithCampaign = _.filter(_.where(donations, {
                    nonprofit_id: this.get('lendAHandId') }), function (donation) {
                    return donation.campaign_id !== null && donation.campaign_id !== undefined;
                });

                if (lendAHandDonationsWithCampaign.length > 0) {
                    this.lendAHandException('lend_a_hand_campaign_in_cart');
                    return 'lendAHandException';
                }
            }

            var newDonation = {
                id: this.get('id'),
                nonprofit_id: this.get('nonprofit_id'),
                nonprofit_name: this.get('nonprofit_name'),
                amount: this.get('amount'),
                dedicate: this.get('dedicate'),
                dedicationSelected: this.get('dedicationSelected'),
                dedicationName: this.get('dedicationName'),
                designation: this.get('designation'),
                processingCharge: this.get('processingCharge'),
                payProcessingCharges: this.get('payProcessingCharges'),
                recurring: this.get('recurring'),
                recurringInterval: this.get('recurringInterval'),
                campaign_id: this.get('campaign_id'),
                campaign_title: this.get('campaign_title'),
                comment: this.get('comment'),
                hide_comment_author: this.get('hide_comment_author'),
                hide_comment_donation_amount: this.get('hide_comment_donation_amount')
            };

            newDonations.push(newDonation);

            // this stops the list of donations from swapping positions on the screen when save() is called
            newDonations.sort(function (a, b) {
                return a.id > b.id;
            });

            _ember['default'].$.jStorage.set('donations', newDonations);

            return newDonation;
        },

        remove: function remove() {
            var donations = _ember['default'].$.jStorage.get('donations');
            var matchDonation = _.findWhere(donations, {
                id: this.get('id')
            });

            var newDonations = _.reject(donations, function (donation) {
                return donation.id === matchDonation.id;
            });

            _ember['default'].$.jStorage.set('donations', newDonations);
        },

        lendAHandException: function lendAHandException(type) {
            console.log('Not added to donations because of lend a hand exception');
            var alertMessage = '';
            if (type === 'charity_in_cart') {
                alertMessage = 'Because you have added a charity donation to you cart, which is tax deductible, this donation must be made separately from gifts benefiting individual/family funds. \n' + 'You will need to complete the checkout process for your current donation, then make your gift benefiting an individual/family fund.';
            } else if (type === 'lend_a_hand_campaign_in_cart') {
                alertMessage = 'Because you have designated a gift that will benefit an individual/family fund, which is not tax-deductible, this gift must be made separately from donations to charitable organizations. \n' + 'Please finish the checkout process for the current donation, then make your charity donations!';
            }

            alert(alertMessage);
        }
    });

    exports['default'] = DonationsLocal;
});
/* global _ */
define('impact-public/models/donations', ['exports', 'ember'], function (exports, _ember) {

    /*
     *Donations Model
     */
    var Donations = _ember['default'].Model.extend({
        shortenName: (function () {
            var cutOff = 14;
            var first = this.get('first_name');
            var last = this.get('last_name');

            if (first && last) {
                var len = last.length + first.length;
                if (len > cutOff) {
                    var full_name = last + ', ' + first;
                    return full_name.substring(0, cutOff - 3) + '...';
                }
                return first + ', ' + last;
            } else if (last) {
                return last;
            } else if (first) {
                return first;
            } else {
                return 'GUEST';
            }
        }).property('first_name', 'last_name'),

        total: (function () {
            return this.get('amount') + this.get('processing_charge');
        }).property('amount'),

        user_first_name: (function () {
            if (this.get('transaction_first_name')) {
                return this.get('transaction_first_name');
            } else {
                return this.get('first_name');
            }
        }).property('first_name', 'transaction_first_name'),

        user_last_name: (function () {
            if (this.get('transaction_last_name')) {
                return this.get('transaction_last_name');
            } else {
                return this.get('last_name');
            }
        }).property('last_name', 'transaction_last_name')
    });

    Donations.table = 'donations';

    exports['default'] = Donations;
});
define('impact-public/models/locations', ['exports', 'ember'], function (exports, _ember) {

    /*
     *Locations Model
     */
    //This was for the regions idea but it was scrapped.
    //Might be useful later tho.
    // Locations.Regions = [{
    //     name: 'North Dakota',
    //     isSelected: false
    // }, {
    //     name: 'Western Minnesota',
    //     isSelected: false
    // }];

    var Locations = _ember['default'].Model.extend({
        isSelected: false,

        displayName: (function () {
            if (this.get('name') !== 'North Dakota' && this.get('name') !== 'Western Minnesota') {
                return this.get('name') + ' Area';
            } else {
                return this.get('name');
            }
        }).property('name')
    });

    Locations.table = 'locations';

    exports['default'] = Locations;
});
define('impact-public/models/organization-campaigns', ['exports', 'ember'], function (exports, _ember) {

  var OrganizationCampaigns = _ember['default'].Model.extend({});

  OrganizationCampaigns.table = 'organization_campaigns';

  exports['default'] = OrganizationCampaigns;
});
define('impact-public/models/organization-documents', ['exports', 'ember'], function (exports, _ember) {

  var Documents = _ember['default'].Model.extend({});
  Documents.table = 'organization_documents';

  exports['default'] = Documents;
});
define('impact-public/models/organization-locations', ['exports', 'ember'], function (exports, _ember) {

    var OrganizationLocations = _ember['default'].Model.extend({
        display: _ember['default'].computed('city', 'county', 'state', function () {
            if (this.get('city')) {
                return this.get('city') + ', ' + this.get('state');
            }
            if (this.get('county')) {
                return this.get('county') + ' County, ' + this.get('state');
            }

            return this.get('state');
        })
    });

    OrganizationLocations.table = 'organization_locations';

    exports['default'] = OrganizationLocations;
});
define('impact-public/models/organizations', ['exports', 'ember', 'impact-public/models/locations', 'impact-public/models/types', 'impact-public/models/donation-suggestions'], function (exports, _ember, _impactPublicModelsLocations, _impactPublicModelsTypes, _impactPublicModelsDonationSuggestions) {

    /*
     *Organizations Model
     */
    var Organizations = _ember['default'].Model.extend({
        donationAdded: false,
        isHighImpact: (function () {
            var imp = this.get('have_plan') && this.get('annual_plan_review') && (this.get('last_year_plan_review') || this.get('plan_will_review')) && this.get('perf_review') && this.get('budget_approved') && this.get('inde_audit') && this.get('finan_review') && this.get('file_990');
            return imp;
        }).property('have_plan', 'annual_plan_review', 'last_year_plan_review', 'plan_will_review', 'perf_review', 'budget_approved', 'inde_audit', 'finan_review', 'file_990'),
        isApproved: (function () {
            return this.get('status') === 'approved';
        }).property('status'),
        isPending: (function () {
            return this.get('status') === 'pending';
        }).property('status'),
        isDeactivated: (function () {
            return this.get('status') === 'deactivated';
        }).property('status'),
        hasMailingAddress: (function () {
            var props = ['mailing_street', 'mailing_city', 'mailing_state', 'mailing_postal_code'];
            for (var key in props) {
                if (_.has(props, key) && !this.get(props[key])) {
                    return false;
                }
            }

            return true;
        }).property('mailing_street', 'mailing_city', 'mailing_state', 'mailing_postal_code'),
        percent_to_goal: (function () {
            var goal = parseInt(this.get('ghd_goal'), 10);
            var total = parseInt(this.get('donations_total_with_match'), 10);
            var percent = total / goal * 100;
            percent = percent.toFixed(1);

            if (percent) {
                return percent;
            } else {
                return 0;
            }
        }).property('total', 'ghd_goal'),

        https_image: (function () {
            var link = this.get('image');
            if (link) {
                link = link.replace('http://uploads.impactgiveback.org.s3.amazonaws.com/', 'https://s3.amazonaws.com/uploads.impactgiveback.org/');
            } else {
                link = 'images/ywca.jpg';
            }
            return link;
        }).property('image'),

        https_logo: (function () {
            var link = this.get('logo');
            if (link) {
                link = link.replace('http://uploads.impactgiveback.org.s3.amazonaws.com/', 'https://s3.amazonaws.com/uploads.impactgiveback.org/');
            }
            return link;
        }).property('logo'),

        videoUrl: (function () {
            var video = this.get('video');
            var prefix = "//www.youtube.com/embed/";
            var youtubeid;
            if (video) {
                if (video.match(/youtube/) && !video.match(/^embed/)) {
                    if (video.indexOf("?v=") > 0) {

                        if (video.indexOf("&", video.indexOf("?v=") + 3) > 0) {
                            youtubeid = video.substring(video.indexOf("?v=") + 3, video.indexOf("&", video.indexOf("?v=") + 3));
                        } else {
                            youtubeid = video.substring(video.indexOf("?v=") + 3);
                        }
                        return prefix + youtubeid;
                    }
                } else if (video.match(/youtu.be/)) {
                    youtubeid = video.substring(video.indexOf(".be") + 4);
                    return prefix + youtubeid;
                } else if (video.match(/vimeo/)) {
                    prefix = "//player.vimeo.com/video/";
                    var vimeoid = video.substring(video.indexOf(".com/") + 5);
                    return prefix + vimeoid;
                }
                return video;
            }
            return "";
        }).property('video'),

        ghdVideoUrl: (function () {
            var video = this.get('ghd_video');
            var prefix = "//www.youtube.com/embed/";
            var youtubeid;
            if (video) {
                if (video.match(/youtube/) && !video.match(/^embed/)) {
                    if (video.indexOf("?v=") > 0) {

                        if (video.indexOf("&", video.indexOf("?v=") + 3) > 0) {
                            youtubeid = video.substring(video.indexOf("?v=") + 3, video.indexOf("&", video.indexOf("?v=") + 3));
                        } else {
                            youtubeid = video.substring(video.indexOf("?v=") + 3);
                        }
                        return prefix + youtubeid;
                    }
                } else if (video.match(/youtu.be/)) {
                    youtubeid = video.substring(video.indexOf(".be") + 4);
                    return prefix + youtubeid;
                } else if (video.match(/vimeo/)) {
                    prefix = "//player.vimeo.com/video/";
                    var vimeoid = video.substring(video.indexOf(".com/") + 5);
                    return prefix + vimeoid;
                }
                return video;
            }
            return "";
        }).property('ghd_video'),

        percent_to_match: (function () {
            var dmf_match = this.get('dmf_match');
            var raised_match = this.get('raised_match');
            var total = this.get('total');
            var total_with_match = this.get('donations_total_with_match');

            if (total >= 250000) {
                var percent = (total / (dmf_match + raised_match) * 100).toFixed(1);
                percent = percent > 100 ? 100 : percent;

                console.log("dmg", dmf_match, "ra", raised_match, "diff", total_with_match - total);

                // var percent = ((total_with_match - total) / (dmf_match + raised_match)) * 100;

                if (percent) {
                    return percent;
                }
            }
            return 0;
        }).property('total', 'dmf_match', 'raised_match'),

        donations_total_with_match: (function () {
            var total_match = parseFloat(this.get('dmf_match')) + parseFloat(this.get('raised_match'));
            var total = parseInt(this.get('total'), 10);

            if (total >= 250000) {
                if (total < total_match) {
                    return total * 2;
                } else {
                    return total + total_match;
                }
            }
            return total;
        }).property('total', 'dmf_match', 'raised_match', 'ghd_goal'),

        allBoardMembers: (function () {
            var board_members = this.get('board_members');
            if (board_members === null) {
                return [];
            }
            if (Array.isArray(board_members)) {
                return board_members;
            } else {
                return JSON.parse(board_members);
            }
        }).property('board_members'),

        //isVideoYoutube: function() {
        //    var video = this.get('video');
        //}.property('video'),
        //isVideoVimeo: function() {
        //    var video = this.get('video');
        //}.property('video'),

        locationObjects: (function () {
            var locations = this.get('locations');
            var org_id = this.get('id');

            if (locations) {
                var location_ids = _.pluck(locations, 'id');

                if (location_ids.length > 0) {
                    return _impactPublicModelsLocations['default'].find({
                        id: location_ids
                    }, {}, 'orgLocations' + org_id);
                } else {
                    return _ember['default'].RSVP.resolve(_ember['default'].A());
                }
            }
        }).property('locations.[]', 'id'),

        typeObjects: (function () {
            var types = this.get('types');
            var org_id = this.get('id');
            //debugger;
            if (types) {
                var type_ids = _.pluck(types, 'id');

                return _impactPublicModelsTypes['default'].find({
                    id: type_ids
                }, {}, 'orgTypes' + org_id);
            }
        }).property('types.[]'),

        typeSortOrder: ['name'],
        typeNamesSorted: _ember['default'].computed.sort('types', 'typeSortOrder'),
        typeNames: _ember['default'].computed.mapBy('typeNamesSorted', 'name'),

        locationSortOrder: ['name'],
        locationNamesSorted: _ember['default'].computed.sort('locations', 'locationSortOrder'),
        locationNames: _ember['default'].computed.mapBy('locationNamesSorted', 'name'),

        stripe_url: (function () {
            return 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_5DIzUZnqN1fmzd8uqyxHfJfZR7zxMFHb&state=' + this.get('id');
        }).property('org_id'),

        ghd_donation_suggestion: _ember['default'].computed('id', function () {
            return _impactPublicModelsDonationSuggestions['default'].findFirstInCache({
                organization_id: this.get('id'),
                type: 'ghd'
            });
        })

    });

    Organizations.table = 'organizations';

    Organizations.statuses = [{
        label: 'Approved',
        value: 'approved'
    }, {
        label: 'Deactivated',
        value: 'deactivated'
    }, {
        label: 'Pending',
        value: 'pending'
    }];

    exports['default'] = Organizations;
});
/* global _ */
define('impact-public/models/organizations_to_types', ['exports', 'ember'], function (exports, _ember) {

  var OrganizationToTypes = _ember['default'].Model.extend({});

  OrganizationToTypes.table = 'organizations_to_types';

  exports['default'] = OrganizationToTypes;
});
define('impact-public/models/recurring-donations', ['exports', 'ember', 'impact-public/models/organizations', 'moment'], function (exports, _ember, _impactPublicModelsOrganizations, _moment) {

    /*
     * Recurring Donations Model
     */
    var RecurringDonations = _ember['default'].Model.extend({
        charge_amount: _ember['default'].computed('quantity', 'plan_amount', function () {
            var amount = this.get('quantity') * this.get('plan_amount');
            return amount;
        }),

        dollarAmount: _ember['default'].computed('amount', function () {
            return (this.get('amount') / 100).toFixed(2);
        }),

        charity: _ember['default'].computed('organization_id', function () {
            return _impactPublicModelsOrganizations['default'].find(this.get('organization_id'));
        }),

        isYearly: _ember['default'].computed('plan_interval', function () {
            return this.get('plan_interval') === 'year';
        }),

        isMonthly: _ember['default'].computed('plan_interval', function () {
            return this.get('plan_interval') === 'month';
        }),

        nextGiftDate: _ember['default'].computed('current_period_end', function () {
            var date = _moment['default'].unix(this.get('current_period_end'));

            date.add(1, 'days');

            return date.unix();
        }),

        statusLabel: _ember['default'].computed('status', function () {
            if (this.get('status') === 'trialing' || this.get('status') === 'active') {
                return 'active';
            } else {
                return this.get('status');
            }
        }),

        isCanceled: _ember['default'].computed('status', function () {
            return this.get('status') === 'canceled';
        })
    });

    RecurringDonations.table = 'recurring_donations';

    exports['default'] = RecurringDonations;
});
define('impact-public/models/stripe-fail-log', ['exports', 'ember'], function (exports, _ember) {

  /*
   *Stripe Fail Log Model
   */
  var StripeFailLog = _ember['default'].Model.extend({});

  StripeFailLog.table = 'stripe_fail_log';

  exports['default'] = StripeFailLog;
});
define('impact-public/models/transactions', ['exports', 'ember'], function (exports, _ember) {

  var TransactionModel = _ember['default'].Model.extend({});

  TransactionModel.table = 'transactions';

  exports['default'] = TransactionModel;
});
define('impact-public/models/types', ['exports', 'ember'], function (exports, _ember) {

    /*
     *Types Model
     */
    var Types = _ember['default'].Model.extend({
        isSelected: false,

        iconClass: (function () {
            switch (this.get('name')) {
                case 'Animals':
                    return 'icon-paw';
                case 'Art & Culture':
                    return 'icon-paint-brush';
                case 'Basic Needs':
                    return 'icon-cutlery';
                case 'Crisis Intervention':
                    return 'icon-life-bouy';
                case 'Disability Services & Resources':
                    return 'icon-wheelchair';
                case 'Education':
                    return 'icon-graduation-cap';
                case 'Faith Based':
                    return 'icon-faith';
                case 'Health & Wellness':
                    return 'icon-stethoscope';
                case 'Youth':
                    return 'icon-youth';
                case 'DMF Funds':
                    return 'icon-dmf';
                case 'Impact Funds':
                    return 'icon-impact';
                case 'Senior Services':
                    return 'icon-seniorcare';
                default:
                    return '';
            }
        }).property('name')
    });

    Types.table = 'types';

    exports['default'] = Types;
});
define('impact-public/models/users', ['exports', 'ember'], function (exports, _ember) {

  /*
   *Users Model
   */
  var Users = _ember['default'].Model.extend({});

  Users.table = 'users';

  exports['default'] = Users;
});
define('impact-public/models/volunteer-submission', ['exports', 'ember'], function (exports, _ember) {

  var Submission = _ember['default'].Model.extend({});

  Submission.table = 'volunteer_submissions';

  exports['default'] = Submission;
});
define('impact-public/models/volunteer', ['exports', 'ember', 'impact-public/models/organizations', 'impact-public/models/volunteer_time_commitment', 'impact-public/models/volunteer_opp_skills', 'moment'], function (exports, _ember, _impactPublicModelsOrganizations, _impactPublicModelsVolunteer_time_commitment, _impactPublicModelsVolunteer_opp_skills, _moment) {

    /*
     *Users Model
     */
    var Volunteer = _ember['default'].Model.extend({
        organization: _ember['default'].computed('organization_id', function () {
            return _impactPublicModelsOrganizations['default'].find(this.get('organization_id'));
        }),

        time_commitment: _ember['default'].computed('volunteer_time_commitment_id', function () {
            return _impactPublicModelsVolunteer_time_commitment['default'].find(this.get('volunteer_time_commitment_id'));
        }),

        skills: _ember['default'].computed('id', function () {
            return _impactPublicModelsVolunteer_opp_skills['default'].find({
                volunteer_id: this.get('id')
            });
        }),

        event_date: _ember['default'].computed('ongoing', 'start_date', 'end_date', 'start_time', 'end_time', function () {
            if (!this.get('ongoing')) {
                var start = (0, _moment['default'])(this.get('start_date'), 'YYYY-MM-DD');
                var end = (0, _moment['default'])(this.get('end_date'), 'YYYY-MM-DD');

                if (this.get('start_date') === this.get('end_date')) {
                    var date = (0, _moment['default'])(this.get('start_date'), 'YYYY-MM-DD');
                    return date.format('dddd, MMMM, DD, YYYY');
                } else if (start.year() === end.year()) {
                    return start.format('dddd, MMMM, DD') + ' to ' + end.format('dddd, MMMM, DD, YYYY');
                } else {
                    return start.format('dddd, MMMM, DD, YYYY') + ' to ' + end.format('dddd, MMMM, DD, YYYY');
                }
            }
            return null;
        })
    });

    Volunteer.table = 'volunteer';

    exports['default'] = Volunteer;
});
define('impact-public/models/volunteer_opp_skills', ['exports', 'ember', 'impact-public/models/volunteer_skills'], function (exports, _ember, _impactPublicModelsVolunteer_skills) {

    var VolunteerOpportunitySkills = _ember['default'].Model.extend({
        skill: _ember['default'].computed('skill_id', function () {
            return _impactPublicModelsVolunteer_skills['default'].find(this.get('skill_id'));
        })
    });

    VolunteerOpportunitySkills.table = 'volunteer_opportunity_skills';

    exports['default'] = VolunteerOpportunitySkills;
});
define('impact-public/models/volunteer_skills', ['exports', 'ember'], function (exports, _ember) {

  var VolunteerSkills = _ember['default'].Model.extend({});

  VolunteerSkills.table = 'volunteer_skills';

  exports['default'] = VolunteerSkills;
});
define('impact-public/models/volunteer_time_commitment', ['exports', 'ember'], function (exports, _ember) {

  var VolunteerTimeCommitment = _ember['default'].Model.extend({});

  VolunteerTimeCommitment.table = 'volunteer_time_commitment';

  exports['default'] = VolunteerTimeCommitment;
});
define('impact-public/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('impact-public/router', ['exports', 'ember', 'impact-public/config/environment', 'moment'], function (exports, _ember, _impactPublicConfigEnvironment, _moment) {

    var Router = _ember['default'].Router.extend({
        location: _impactPublicConfigEnvironment['default'].locationType,
        rootURL: _impactPublicConfigEnvironment['default'].rootURL
    });

    Router.map(function () {

        if (_impactPublicConfigEnvironment['default'].isImpactApp) {
            this.route('home', {
                path: '/'
            });
        } else {
            this.route('home');
            this.route('home-lah', {
                path: '/'
            });
        }

        this.route('recover');

        this.route('logout');

        this.route("countdown");
        this.route("thank-you");

        this.route('about');
        this.route('contact');
        this.route('sponsors');
        this.route('checkout', function () {
            this.route('review');
        });
        this.route('signin');
        this.route('account', function () {
            this.route('details', {
                path: '/'
            });
            this.route('donations');
            this.route('change-password');
        });

        //Catch all route for any unmatched routes
        this.route('catchAll', {
            path: '*:'
        });
        this.route('charity', {
            path: '/charity/:id'
        });
        this.route("charity-list");
        this.route('volunteer', function () {
            this.route('opportunity', { path: '/:opportunity_id' });

            this.route('events', function () {
                this.route('all');
            });
        });
        this.route('home-lah');
    });

    _ember['default'].Router.reopen({
        logging: true,
        notifyGoogleAnalytics: (function () {
            if (_impactPublicConfigEnvironment['default'].environment !== 'development') {
                return _gaq.push(['_trackPageview', this.get('url')]);
            } else {
                return false;
            }
        }).on('didTransition')
    });

    // Scrolls to top after each transition.Otherwise the browser keeps scroll position
    // This was an issue on laptop screens
    _ember['default'].Route.reopen({
        renderTemplate: function renderTemplate() {
            this._super();
            window.scrollTo(0, 0);
        },
        //Check to see if we need to redirect to countdown page or thank you page
        //This will be triggered in every route. Make sure this._super() is called
        beforeModel: function beforeModel(transition) {
            if (_impactPublicConfigEnvironment['default'].isGivingHeartsDay) {
                if ((0, _moment['default'])().unix() < _impactPublicConfigEnvironment['default'].startGivingHeartsDay) {
                    if (this.routeName === 'countdown') {
                        return true;
                    } else {
                        if (transition) {
                            transition.abort();
                        }
                        this.transitionTo('countdown');
                        return true;
                    }
                }

                if ((0, _moment['default'])().unix() > _impactPublicConfigEnvironment['default'].endGivingHeartsDay) {
                    if (this.routeName === 'thank-you' || this.routeName === 'contact' || this.routeName === 'account' || this.routeName === 'signin' || this.routeName === 'change-password' || this.routeName === 'account.index') {
                        return true;
                    } else {
                        if (transition) {
                            transition.abort();
                        }
                        this.transitionTo('thank-you');
                        return true;
                    }
                }
                return true;
            } else {
                return true;
            }
        }
    });

    exports['default'] = Router;
});
/* global _gaq */
define('impact-public/routes/account', ['exports', 'ember'], function (exports, _ember) {

    var AccountIndexRoute = _ember['default'].Route.extend({
        beforeModel: function beforeModel(transition) {
            this._super();
            var user = this.controllerFor('application').get('user');
            var guest = this.controllerFor('application').get('guest');
            if (!user || guest) {
                this.transitionTo('signin');
                this.controllerFor('signin').set('allowGuest', false);
                this.controllerFor('signin').set('signup', false);
                this.controllerFor('signin').set('toCheckout', false);
                this.controllerFor('application').set('savedTransition', transition);
            }
        }
    });

    exports['default'] = AccountIndexRoute;
});
define('impact-public/routes/account/change-password', ['exports', 'ember'], function (exports, _ember) {

    var ChangePasswordRoute = _ember['default'].Route.extend({
        beforeModel: function beforeModel(transition) {
            var user = this.controllerFor('application').get('user');
            var guest = this.controllerFor('application').get('guest');
            if (!user || guest) {
                this.transitionTo('signin');
                this.controllerFor('signin').set('allowGuest', false);
                this.controllerFor('signin').set('signup', false);
                this.controllerFor('signin').set('toCheckout', false);
                this.controllerFor('application').set('savedTransition', transition);
            }
        }
    });

    exports['default'] = ChangePasswordRoute;
});
define('impact-public/routes/account/details', ['exports', 'ember', 'impact-public/models/users'], function (exports, _ember, _impactPublicModelsUsers) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model() {
            var userId = this.controllerFor('application').get('user.id');
            return _impactPublicModelsUsers['default'].find(userId);
        },

        setupController: function setupController(controller, model) {
            controller.set('model', model);
            controller.reset();
        }
    });
});
define('impact-public/routes/account/donations', ['exports', 'ember', 'impact-public/models/donations', 'impact-public/models/recurring-donations'], function (exports, _ember, _impactPublicModelsDonations, _impactPublicModelsRecurringDonations) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model(params) {
            var userId = this.controllerFor('application').get('user.id');
            var donations = _impactPublicModelsDonations['default'].find({
                user_id: userId
            }, {
                sort: {
                    date: 'desc'
                },
                limit: 21,
                offset: params.offset
            });
            var recurringDonations = _impactPublicModelsRecurringDonations['default'].find({
                user_id: userId
            }, {
                sort: {
                    start: 'desc'
                }
            });

            return _ember['default'].RSVP.hash({
                donations: donations,
                recurringDonations: recurringDonations
            });
        },

        setupController: function setupController(controller, model) {
            controller.set('donations', model.donations);
            controller.set('recurringDonations', model.recurringDonations);
            controller.checkPagination();
            controller.reset();
        }
    });
});
define('impact-public/routes/application', ['exports', 'ember', 'impact-public/utils/token', 'impact-public/utils/api', 'moment', 'impact-public/models/donations-local', 'impact-public/config/environment'], function (exports, _ember, _impactPublicUtilsToken, _impactPublicUtilsApi, _moment, _impactPublicModelsDonationsLocal, _impactPublicConfigEnvironment) {

    /* global $ */

    var ApplicationRoute = _ember['default'].Route.extend({
        analytics: _ember['default'].inject.service(),
        fb: _ember['default'].inject.service(),
        ghd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() {
            this.get('fb').FBInit();
            if (this.get('ghd').showCountdown()) {
                this.transitionTo('countdown');
            }
        },
        model: function model() {
            if (_impactPublicUtilsToken['default'].get()) {
                return _impactPublicUtilsApi['default'].get('/users/me', {}, function () {}, true);
            } else {
                return null;
            }
        },

        afterModel: function afterModel(user) {
            if (user === null) {
                //No token
                return null;
            } else {
                if (user.error) {
                    this.controllerFor('application').set('user', null);
                    _impactPublicUtilsToken['default'].set(false);
                    _ember['default'].$.jStorage.set('user', null);
                    _ember['default'].$.jStorage.set('token', null);
                    this.transitionTo('logout');
                    this.growl.info('Session expired. Please log in again.');
                } else if (user.result) {
                    //Logout if they are not impact or an org
                    if (!user.result[0]) {
                        this.controllerFor('application').set('user', null);
                        _impactPublicUtilsToken['default'].set(false);
                        _ember['default'].$.jStorage.set('user', null);
                        _ember['default'].$.jStorage.set('token', null);
                        this.transitionTo('logout');
                        this.growl.info('Session expired. Please log in again.');
                    } else {
                        this.controllerFor('application').set('user', _ember['default'].Object.create(user.result[0]));
                        return _ember['default'].Object.create(user.result[0]);
                    }
                }
            }
        },

        setupController: function setupController(controller, model) {
            //make sure the user is still signed in and token has not expired.
            //this.controller.set('user', model);
            if (model) {
                controller.set('user', model.result[0]);
                controller.set('token', _impactPublicUtilsToken['default'].get());
                _ember['default'].$.jStorage.set('user', model.result[0]);
            } else {
                _ember['default'].$.jStorage.set('user', null);
            }
            if (_ember['default'].$.jStorage.get('guest')) {
                controller.set('guest', _ember['default'].$.jStorage.get('guest'));
            }
            var donations = _ember['default'].A([]);
            if (_ember['default'].$.jStorage.get('donations')) {
                _.each(_ember['default'].$.jStorage.get('donations'), function (donation) {
                    var object = _impactPublicModelsDonationsLocal['default'].create(donation);
                    donations.pushObject(object);
                });
            }
            controller.set('donations', donations);
            controller.set('isGivingHeartsDay', _impactPublicConfigEnvironment['default'].isGivingHeartsDay);
            controller.set('startGivingHeartsDay', _impactPublicConfigEnvironment['default'].startGivingHeartsDay);
            controller.set('endGivingHeartsDay', _impactPublicConfigEnvironment['default'].endGivingHeartsDay);

            //transition to thank you, when GHD is over
            if (_impactPublicConfigEnvironment['default'].isGivingHeartsDay) {
                setTimeout(function () {
                    console.log("transition");
                    controller.transitionToRoute('thank-you');
                    $('.nav').addClass('thankyou-nav').find('a').html('');
                }, (_impactPublicConfigEnvironment['default'].endGivingHeartsDay - (0, _moment['default'])().unix()) * 1000);
            }
        },

        actions: {
            scrollTo: function scrollTo(anchorId) {
                //if partners we need to remove the all filter if it is set
                var trackingLabel = '';
                if (anchorId === 'sponsors') {
                    this.controllerFor('home').set('allFilter', false);
                    trackingLabel = 'partners';
                } else {
                    trackingLabel = anchorId;
                }

                this.get('analytics').track({
                    category: 'navigation',
                    action: 'click',
                    label: trackingLabel
                });

                //transition to home first if we are not there yet
                //then scroll to the anchor
                if (this.controller.currentPath !== 'home') {
                    this.transitionTo('home').then(function () {
                        _ember['default'].run.schedule('afterRender', function () {
                            $('html,body').animate({
                                scrollTop: $('#' + anchorId).offset().top
                            }, 'slow', function () {
                                if (anchorId === 'donate') {
                                    $('#name-search-input').focus();
                                }
                            });
                        });
                    });
                } else {
                    $('html,body').animate({
                        scrollTop: $('#' + anchorId).offset().top
                    }, 'slow', function () {
                        if (anchorId === 'donate') {
                            $('#name-search-input').focus();
                        }
                    });
                }
            }
        }
    });

    exports['default'] = ApplicationRoute;
});
/* global _ */
define('impact-public/routes/catch-all', ['exports', 'ember'], function (exports, _ember) {

	var CatchAllRoute = _ember['default'].Route.extend({
		redirect: function redirect() {
			this.transitionTo('home');
		}
	});

	exports['default'] = CatchAllRoute;
});
define('impact-public/routes/charity-list', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({

        manageGhd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() {
            this._super();
        },

        model: function model() {
            this.set('isGHD', this.get('manageGhd.isGHD'));
        },

        setupController: function setupController(controller, model) {
            controller.set('model', model);
        }
    });
});
define('impact-public/routes/charity', ['exports', 'ember', 'impact-public/models/organizations', 'impact-public/models/donation-suggestions', 'impact-public/models/volunteer', 'impact-public/models/organization-campaigns', 'impact-public/models/organization-documents', 'impact-public/utils/api', 'moment', 'impact-public/config/environment'], function (exports, _ember, _impactPublicModelsOrganizations, _impactPublicModelsDonationSuggestions, _impactPublicModelsVolunteer, _impactPublicModelsOrganizationCampaigns, _impactPublicModelsOrganizationDocuments, _impactPublicUtilsApi, _moment, _impactPublicConfigEnvironment) {
    exports['default'] = _ember['default'].Route.extend({
        manageGhd: _ember['default'].inject.service('manage-ghd'),
        beforeModel: function beforeModel() {
            this._super();
            if (this.get('manageGhd.isGHD')) {
                this.transitionTo('home');
            }
        },

        model: function model(params) {
            var charity = _impactPublicModelsOrganizations['default'].find(params.id);
            var donationSuggestions = _impactPublicModelsDonationSuggestions['default'].find({
                organization_id: params.id,
                type: 'general'
            });
            var volunteerOpportunities1 = _impactPublicModelsVolunteer['default'].find({
                organization_id: params.id,
                removed: false,
                start_date: {
                    '>=': (0, _moment['default'])().format('YYYY-MM-DD')
                },
                ongoing: false
            });
            var volunteerOpportunities2 = _impactPublicModelsVolunteer['default'].find({
                organization_id: params.id,
                removed: false,
                ongoing: true
            });

            var organizationCampaigns = _impactPublicModelsOrganizationCampaigns['default'].find({
                organization_id: params.id,
                end_date_epoch: {
                    '>=': (0, _moment['default'])().unix()
                },
                start_date_epoch: {
                    '<=': (0, _moment['default'])().unix()
                },
                is_active: true
            });

            var organizationDocuments = _impactPublicModelsOrganizationDocuments['default'].find({
                organization_id: params.id
            });

            var comments = _impactPublicUtilsApi['default'].get('/giving/comments/' + params.id, {}, function () {}, true);

            var RSVPHash = {
                charity: charity,
                donationSuggestions: donationSuggestions,
                volunteerOpportunities1: volunteerOpportunities1,
                volunteerOpportunities2: volunteerOpportunities2,
                organizationCampaigns: organizationCampaigns,
                organizationDocuments: organizationDocuments,
                comments: comments
            };
            console.log('is impact app: ', _impactPublicConfigEnvironment['default'].isImpactApp);

            if (!_impactPublicConfigEnvironment['default'].isImpactApp) {
                RSVPHash.donations = _impactPublicUtilsApi['default'].get('/lah/donations/' + params.id, {}, function () {}, true);
            }
            return _ember['default'].RSVP.hash(RSVPHash);
        },

        setupController: function setupController(controller, model) {
            var v = _ember['default'].A([]);
            model.volunteerOpportunities1.forEach(function (item) {
                v.push(item);
            });
            model.volunteerOpportunities2.forEach(function (item) {
                v.push(item);
            });
            controller.set('model', model.charity);
            controller.set('donationSuggestions', model.donationSuggestions);
            controller.set('volunteerOpportunities', v);
            controller.set('campaigns', model.organizationCampaigns);
            controller.set('organizationDocuments', model.organizationDocuments);
            controller.set('comments', model.comments);
            if (!_impactPublicConfigEnvironment['default'].isImpactApp) {
                controller.set('donations', model.donations);
            }
        }
    });
});
define('impact-public/routes/checkout/index', ['exports', 'ember'], function (exports, _ember) {

    var CheckoutRoute = _ember['default'].Route.extend({
        setupController: function setupController(controller) {
            var cart = _ember['default'].$.jStorage.get('cart');
            if (cart && cart.payProcessingCharges === true) {
                controller.set('payProcessingCharges', cart.payProcessingCharges);
            }
            _ember['default'].$.jStorage.set('checkoutVisited', true, {
                TTL: 86400000
            });

            controller.reset();
        }
    });

    exports['default'] = CheckoutRoute;
});
define('impact-public/routes/checkout/review', ['exports', 'ember'], function (exports, _ember) {

    var CheckoutReviewRoute = _ember['default'].Route.extend({
        beforeModel: function beforeModel(transition) {
            this._super();
            var cart = _ember['default'].$.jStorage.get('cart');

            var hasDonations = _ember['default'].$.jStorage.get('donations');
            if (!hasDonations || hasDonations.length === 0) {
                this.transitionTo('checkout.index');
            }
            var user = this.controllerFor('application').get('user');
            var guest = this.controllerFor('application').get('guest');
            if (!user && !guest) {
                this.transitionTo('signin');
                this.controllerFor('signin').set('allowGuest', !cart.recurring);
                this.controllerFor('signin').set('signup', true);
                this.controllerFor('signin').set('toCheckout', true);
                this.controllerFor('application').set('savedTransition', transition);
            }
            return user;
        },

        setupController: function setupController(controller) {
            controller.set('cart', _ember['default'].$.jStorage.get('cart'));
            var user = this.controllerFor('application').get('user');
            var guest = this.controllerFor('application').get('guest');
            if (!user || guest) {
                controller.set('guest', true);
                controller.set('isUser', false);
            } else {
                controller.set('guest', false);
                controller.set('isUser', true);
            }

            controller.reset();
            //controller.testReceipt();
        },

        actions: {
            willTransition: function willTransition(transition) {
                if (this.controller.get('loading') || this.controller.get('isProcessingPayment')) {
                    transition.abort();
                } else {
                    // Bubble the `willTransition` action so that
                    // parent routes can decide whether or not to abort.
                    return true;
                }
            }
        }
    });

    exports['default'] = CheckoutReviewRoute;
});
define('impact-public/routes/contact', ['exports', 'ember'], function (exports, _ember) {

    var ContactRoute = _ember['default'].Route.extend({
        deactivate: function deactivate() {
            this.get('controller').reset();
        }
    });

    exports['default'] = ContactRoute;
});
define('impact-public/routes/home-lah', ['exports', 'ember', 'impact-public/models/organizations', 'impact-public/models/locations'], function (exports, _ember, _impactPublicModelsOrganizations, _impactPublicModelsLocations) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      var organizations = _impactPublicModelsOrganizations['default'].find({
        status: 'active'
      });
      var locations = _impactPublicModelsLocations['default'].find();

      return _ember['default'].RSVP.hash({
        organizations: organizations,
        locations: locations
      });
    },

    setupController: function setupController(controller, model) {

      //controller.set('filtered', model.organizations);
      controller.set('allOrganizations', model.organizations);
      controller.set('locations', model.locations);

      controller.send('filterResults');
    }
  });
});
define('impact-public/routes/home', ['exports', 'ember', 'impact-public/models/organizations', 'impact-public/models/locations', 'impact-public/models/types', 'impact-public/utils/api', 'impact-public/models/donation-suggestions', 'impact-public/config/environment'], function (exports, _ember, _impactPublicModelsOrganizations, _impactPublicModelsLocations, _impactPublicModelsTypes, _impactPublicUtilsApi, _impactPublicModelsDonationSuggestions, _impactPublicConfigEnvironment) {
    var HomeRoute = _ember['default'].Route.extend({
        ghd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() {
            this._super();

            //Here we make sure that Ember.SocketIO is initialized BEFORE we enter any other routes.
            return new _ember['default'].RSVP.Promise(function (resolve) {

                //This starts the Pusher Connection process.
                _ember['default'].SocketIO.join('impact_giveback');

                //This is a recursive function that calls itself every 500 ms until Ember.SocketIO.io is initialized.
                var subscribe = function subscribe() {
                    if (!_ember['default'].SocketIO.io) {
                        return _ember['default'].run.later(function () {
                            subscribe();
                        }, 500);
                    }
                    //debugger;
                    resolve(true);
                };
                //Start the waiting...
                subscribe();

                //reject(error);
            });
        },

        model: function model() {

            var organizations = _impactPublicModelsOrganizations['default'].find({
                status: 'active' //,
                // have_registered_for_stripe: true
            });

            var locations = _impactPublicModelsLocations['default'].find();

            var types = _impactPublicModelsTypes['default'].find();

            return _ember['default'].RSVP.hash({
                organizations: organizations,
                locations: locations,
                types: types
            });
        },

        setupController: function setupController(controller, model) {
            // TODO remove this unused code
            // var donations = [];
            // if (Ember.$.jStorage.get('donations')) {
            //     donations = Ember.$.jStorage.get('donations');
            // }

            controller.set('model', model.organizations);
            controller.set('allOrganizations', model.organizations);
            controller.set('locations', model.locations);
            controller.set('types', model.types);
            controller.set('noMore', false);

            if (_impactPublicConfigEnvironment['default'].isImpactApp) {
                if (model.organizations && model.organizations.content.length > 0) {
                    var samples = [];
                    var length = model.organizations.content.length - 1;
                    var sampleNumber = 0;
                    if (length + 1 < 9) {
                        sampleNumber = length + 1;
                    } else {
                        sampleNumber = 9;
                    }
                    while (samples.length < sampleNumber) {
                        var random = _.random(length);
                        //Samples cannot be repeated
                        var found = _.contains(samples, random);
                        if (!found) {
                            samples[samples.length] = random;
                        }
                    }
                    var randomOrgs = [];
                    _.each(samples, function (value) {
                        randomOrgs.push(model.organizations.content[value]);
                    });
                    controller.set('sampleOrganizations', randomOrgs);
                } else {
                    controller.set('allFilter', true);
                    controller.set('hasFilters', true);
                }
            }

            var impactRoom = _ember['default'].SocketIO.io.channels.channels.impact_giveback; // Ember.SocketIO.join('global');
            if (this.get('ghd.isGHD')) {
                //Get the donation suggestions for GHD
                _impactPublicModelsDonationSuggestions['default'].find({
                    type: 'ghd'
                });

                //Get the total donations amount
                _impactPublicUtilsApi['default'].get('/giving/donations', {}, function (json) {
                    if (json.error === undefined) {
                        controller.set('donationsSoFar', json.result.total_with_match);
                        controller.set('totalDonors', json.result.total_donors);
                    } else {
                        controller.set('donationsSoFar', '');
                        controller.set('totalDonors', '');
                    }
                    //subscribe to pusher events for dynamic total.
                    impactRoom.bind('/giving/donations', function (data) {
                        controller.set('donationsSoFar', data.total_with_match);
                        controller.set('totalDonors', json.result.total_donors);
                    });
                });
            }

            impactRoom.bind('/ghd/countdown', function () {
                //Reload page when Giving Hearts Day starts on server side
                window.location.reload(true);
            });

            var typeFilter = controller.get('typeFilterParams');
            if (typeFilter && typeFilter.length) {
                controller.setTypesFromParams(typeFilter);
            }

            if (!_impactPublicConfigEnvironment['default'].isImpactApp) {
                controller.resetLAH();
            }
        },

        actions: {
            getMore: function getMore() {
                var controller = this.get('controller'),
                    start = controller.get('start') + 9,
                    stop = controller.get('stop') + 9;
                controller.set('start', start);
                controller.set('stop', stop);
                var model = controller.get('allOrganizationsSorted');
                if (stop > controller.get('allOrganizations.length') - 1) {
                    controller.set('noMore', true);
                    stop = controller.get('allOrganizations.length') - 1;
                }
                for (var i = start; i <= stop; i++) {
                    model.objectAt(i).set('_showOnPage', true);
                }
                controller.set('loadingMore', false);
            }
        }
    });

    exports['default'] = HomeRoute;
});
/* global _ */
define('impact-public/routes/loading', ['exports', 'ember'], function (exports, _ember) {

    var LoadingRoute = _ember['default'].Route.extend({
        renderTemplate: function renderTemplate() {
            this.render('loading');
        }
    });

    exports['default'] = LoadingRoute;
});
define('impact-public/routes/logout', ['exports', 'ember'], function (exports, _ember) {

    var LogoutRoute = _ember['default'].Route.extend({
        beforeModel: function beforeModel() {
            this.controllerFor('application').reset();
            //delete local storage
            _ember['default'].$.jStorage.deleteKey('user');
            _ember['default'].$.jStorage.deleteKey('token');
            if (this.controllerFor('application').get('isGHD')) {
                this.transitionTo('home');
            } else {
                this.transitionTo('thank-you');
            }
        }
    });

    exports['default'] = LogoutRoute;
});
define('impact-public/routes/signin', ['exports', 'ember'], function (exports, _ember) {

    var SignInRoute = _ember['default'].Route.extend({
        beforeModel: function beforeModel() {
            this._super();
            // var self = this;
            // //Check if the checkout route was visited. If not, redirect to it
            // var visited = $.jStorage.get('checkoutVisited');
            // if (!visited) {
            //     transition.abort();
            //     this.transitionTo('checkout.index');
            // } else {
            //     //No need to sign in if they haven't added donations
            //     var hasDonations = $.jStorage.get('donations');
            //     if (!hasDonations || hasDonations.length === 0) {
            //         this.transitionTo('checkout.index');
            //     }

            //     var token = Token.get();
            //     if (token) {
            //         this.transitionTo('checkout.review')
            //     } else {
            //         console.log('No token detected');
            //         return true;
            //     }
            // }
        },

        setupController: function setupController(controller) {
            if (this.controllerFor('application').get('token') && this.controllerFor('application').get('user')) {
                this.transitionTo('account');
            }

            var savedTransition = this.controllerFor('application').get('savedTransition');
            controller.set('savedTransition', savedTransition);
            controller.reset();
        }
    });

    exports['default'] = SignInRoute;
});
define('impact-public/routes/thank-you', ['exports', 'ember', 'impact-public/utils/api'], function (exports, _ember, _impactPublicUtilsApi) {
    exports['default'] = _ember['default'].Route.extend({
        ghd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() /*transition*/{
            //this makes a routing loop on GHD. Don't know what the logic was here.
            //if (this.get('ghd.isGHD')) {
            return;
            //} else {
            //    transition.abort();
            //    this.transitionTo('home');
            //}
        },
        setupController: function setupController(controller /*, model*/) {
            _impactPublicUtilsApi['default'].get('/giving/donations', {}, function (json) {
                if (json.error === undefined) {
                    controller.set('donationsSoFar', json.result.total_with_match);
                } else {
                    controller.set('donationsSoFar', '');
                }
            });
        }
    });
});
define('impact-public/routes/volunteer/events/all', ['exports', 'ember', 'impact-public/models/volunteer'], function (exports, _ember, _impactPublicModelsVolunteer) {
    exports['default'] = _ember['default'].Route.extend({
        manageGhd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() {
            if (this.get('manageGhd.isGHD')) {
                this.transitionTo('home');
            }
        },

        model: function model() {
            return _impactPublicModelsVolunteer['default'].find({
                ongoing: false
            });
        },

        setupController: function setupController(controller, model) {
            controller.set('model', model);
        }
    });
});
define('impact-public/routes/volunteer/index', ['exports', 'ember', 'impact-public/models/volunteer', 'impact-public/models/types', 'impact-public/models/volunteer_skills'], function (exports, _ember, _impactPublicModelsVolunteer, _impactPublicModelsTypes, _impactPublicModelsVolunteer_skills) {
    exports['default'] = _ember['default'].Route.extend({
        manageGhd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() {
            if (this.get('manageGhd.isGHD')) {
                this.transitionTo('home');
            }
        },

        model: function model(params) {
            return _ember['default'].RSVP.hash({
                volunteer_opportunities: _impactPublicModelsVolunteer['default'].find({
                    removed: false
                }),
                //time_commitments: time_commitments.find(),
                skills: _impactPublicModelsVolunteer_skills['default'].find(),
                types: _impactPublicModelsTypes['default'].find(),
                charity: params.charity
            });
        },

        setupController: function setupController(controller, model) {
            controller.set('model', model);
            controller.resetFilters();
            if (model.charity) {
                controller.set('charity', model.charity);
            }
        }
    });
});

//import time_commitments from 'impact-public/models/volunteer_time_commitment';
define('impact-public/routes/volunteer/opportunity', ['exports', 'ember', 'impact-public/models/volunteer', 'impact-public/models/volunteer-submission'], function (exports, _ember, _impactPublicModelsVolunteer, _impactPublicModelsVolunteerSubmission) {
    exports['default'] = _ember['default'].Route.extend({
        manageGhd: _ember['default'].inject.service('manage-ghd'),

        beforeModel: function beforeModel() {
            if (this.get('manageGhd.isGHD')) {
                this.transitionTo('home');
            }
        },

        model: function model(params) {
            var user = this.controllerFor('application').get('user');

            var promises = {
                op: _impactPublicModelsVolunteer['default'].find(params.opportunity_id),
                user: user
            };

            if (user) {
                promises.submissions = _impactPublicModelsVolunteerSubmission['default'].find({
                    volunteer_id: params.opportunity_id,
                    email: user.email
                });
            } else {
                promises.submissions = null;
            }

            return _ember['default'].RSVP.hash(promises);
        },

        setupController: function setupController(controller, model) {
            controller.set('model', model);

            if (model.submissions && model.submissions.get('content').length > 0) {
                controller.set('userPreviouslyApplied', true);
            } else {
                controller.set('userPreviouslyApplied', false);
            }

            controller.set('userJustApplied', false);

            var o = {};
            if (controller.get('model.user')) {
                o = {
                    first_name: controller.get('model.user.first_name'),
                    last_name: controller.get('model.user.last_name'),
                    email: controller.get('model.user.email'),
                    phone: controller.get('model.user.phone')
                };
            }

            controller.set('submission', _impactPublicModelsVolunteerSubmission['default'].createRecord(_.extend({}, o, {
                volunteer_id: controller.get('model.op.id'),
                organization_id: controller.get('model.op.organization.id')
            })));
        }
    });
});
/* global _ */
define('impact-public/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('impact-public/services/analytics', ['exports', 'ember', 'impact-public/config/environment'], function (exports, _ember, _impactPublicConfigEnvironment) {
    exports['default'] = _ember['default'].Service.extend({
        /**
         * Send action to Google analytics
         * @param options obj
         *
         * var track_option {
         *    category: 'test-cate',
         *    action: 'test-action',
         *    label: 'test-label'
         *  }
         *
         *  tracker._trackEvent(track_options);
         *
         */
        track: function track(options) {
            // category and action are required
            // label (string) and value (int) are optional

            var value = '';
            if (options.value) {
                value = parseFloat(options.value);
                value = value * 100;
                value = parseInt(value);
            }

            // google analytics may be blocked by things like ghostery or EFF's privacy badger
            // so we'll check to see that it's setup and that we're in production before
            // doing any tracking.
            if (_impactPublicConfigEnvironment['default'].environment === 'production' && typeof _gat !== 'undefined') {
                console.log("TRACKING", options);

                var tracker = _gat._getTracker('UA-59394579-1');
                if (value !== "") {
                    tracker._trackEvent(options.category, options.action, options.label, value);
                } else {
                    if (tracker._trackEvent(options.category || 'CATEGORY', options.action || 'ACTION', options.label) === false) {
                        console.log('failed to track');
                    }
                }
            } else {
                // log
                console.log("Tracking not enabled, but would have tracked: " + "Category: " + (options.category ? options.category.toUpperCase() : "") + " Action: " + (options.action ? options.action.toUpperCase() : "") + " Label: " + (options.label ? options.label.toUpperCase() : "") + " Value: " + value);
            }
        }
    });
});
/* global _gat */
define('impact-public/services/app-mode', ['exports', 'ember', 'impact-public/config/environment'], function (exports, _ember, _impactPublicConfigEnvironment) {
  exports['default'] = _ember['default'].Service.extend({
    is_impact_app: _impactPublicConfigEnvironment['default'].isImpactApp,
    is_lah_app: !_impactPublicConfigEnvironment['default'].isImpactApp
  });
});
define('impact-public/services/browser-update', ['exports', 'ember-cli-browser-update/services/browser-update', 'impact-public/config/environment'], function (exports, _emberCliBrowserUpdateServicesBrowserUpdate, _impactPublicConfigEnvironment) {
	exports['default'] = _emberCliBrowserUpdateServicesBrowserUpdate['default'].extend({
		config: _impactPublicConfigEnvironment['default'].browserUpdate || {}
	});
});
define('impact-public/services/fb', ['exports', 'ember-cli-facebook-js-sdk/services/fb'], function (exports, _emberCliFacebookJsSdkServicesFb) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFacebookJsSdkServicesFb['default'];
    }
  });
});
define('impact-public/services/growl-notifications', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Service.extend({
        notifications: _ember['default'].A(),

        error: function error(context, opts) {
            opts = opts || {};
            opts.type = 'error';
            this._notify.call(this, context, opts);
        },
        warning: function warning(context, opts) {
            opts = opts || {};
            opts.type = 'warning';
            this._notify.call(this, context, opts);
        },
        info: function info(context, opts) {
            opts = opts || {};
            opts.type = 'info';
            this._notify.call(this, context, opts);
        },
        success: function success(context, opts) {
            opts = opts || {};
            opts.type = 'success';
            this._notify.call(this, context, opts);
        },

        _notify: function _notify(context, opts) {
            // default options
            var options = {
                type: 'error',
                fadeIn: true,
                closeIn: 5000, // automatically close in 5 seconds.
                clickToDismiss: false
            };

            _ember['default'].merge(options, opts);

            //This is helpful for not showing the same notifications twice
            //var existing = this.get('notifications').findBy('content', context);
            //if (existing) {
            //    return;
            //}

            var notification = _ember['default'].ObjectProxy.extend({
                content: context,
                options: options,
                updated: 0,
                isInfo: (function () {
                    return options.type === 'info';
                }).property(),
                isAlert: (function () {
                    return options.type === 'warning';
                }).property(),
                isError: (function () {
                    return options.type === 'error';
                }).property(),
                isSuccess: (function () {
                    return options.type === 'success';
                }).property()
            }).create();

            this.get('notifications').pushObject(notification);
        }
    });
});
define('impact-public/services/labels', ['exports', 'ember', 'impact-public/config/environment'], function (exports, _ember, _impactPublicConfigEnvironment) {

  var dict = {};

  // Keeping this simple for now until the need arises for more externalized strings

  if (_impactPublicConfigEnvironment['default'].isImpactApp) {
    dict = {
      ADMIN_NAME: 'Impact Institue',
      CHARITY: 'Charity',
      CHARITIES: 'Charities',
      TLA: 'GHD',
      FUNDRAISER_NAME: 'Giving Hearts Day',
      OUR: 'Our',
      DONATION_SLOGAN: 'Make an Impact',
      URL: 'impactgiveback.org',
      PAYMENT_NAME: "Impact Institute"
    };
  } else {
    dict = {
      ADMIN_NAME: 'Admin User',
      CHARITY: 'Campaign',
      CHARITIES: 'Campaigns',
      TLA: 'LAH',
      FUNDRAISER_NAME: 'Lend A Hand Up',
      OUR: 'Their',
      DONATION_SLOGAN: 'Lend A Hand Up',
      URL: 'lendahandup.org',
      PAYMENT_NAME: "Lend A Hand Up Organization"
    };
  }

  exports['default'] = _ember['default'].Service.extend(dict);
});
define('impact-public/services/manage-ghd', ['exports', 'ember', 'impact-public/config/environment', 'moment'], function (exports, _ember, _impactPublicConfigEnvironment, _moment) {
    exports['default'] = _ember['default'].Service.extend({
        config: _impactPublicConfigEnvironment['default'],

        showCountdown: function showCountdown() {
            var config = this.get('config');

            if (config.isGivingHeartsDay) {
                if ((0, _moment['default'])().unix() < config.startGivingHeartsDay) {
                    return true;
                }
            }

            return false;
        },

        isGHD: _ember['default'].computed('config.isGivingHeartsDay', 'config.startGivingHeartsDay', 'config.endGivingHeartsDay', function () {
            var config = this.get('config');

            if (config.isGivingHeartsDay) {
                if ((0, _moment['default'])().unix() < config.startGivingHeartsDay) {
                    return false;
                }
                if ((0, _moment['default'])().unix() > config.endGivingHeartsDay) {
                    return false;
                }
                return true;
            } else {
                return false;
            }
        })
    });
});
define('impact-public/services/moment', ['exports', 'ember', 'impact-public/config/environment', 'ember-moment/services/moment'], function (exports, _ember, _impactPublicConfigEnvironment, _emberMomentServicesMoment) {
  exports['default'] = _emberMomentServicesMoment['default'].extend({
    defaultFormat: _ember['default'].get(_impactPublicConfigEnvironment['default'], 'moment.outputFormat')
  });
});
define('impact-public/services/stripe', ['exports', 'ember-stripe-service/services/stripe'], function (exports, _emberStripeServiceServicesStripe) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberStripeServiceServicesStripe['default'];
    }
  });
});
define('impact-public/services/text-measurer', ['exports', 'ember-text-measurer/services/text-measurer'], function (exports, _emberTextMeasurerServicesTextMeasurer) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberTextMeasurerServicesTextMeasurer['default'];
    }
  });
});
define("impact-public/templates/account", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "BnC88Gjj", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 no-print\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"ol\",[]],[\"static-attr\",\"class\",\"secondary-nav\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"account.details\"],null,1],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"account.donations\"],null,0],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-print\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"content-header\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h2\",[]],[\"static-attr\",\"class\",\"blue\"],[\"flush-element\"],[\"text\",\"My Account\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"hr\",[]],[\"static-attr\",\"class\",\"divider blue\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-content\"],[\"static-attr\",\"style\",\"margin-top: 10px;\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                            Donations\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            Account Details\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/account.hbs" } });
});
define("impact-public/templates/account/change-password", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "tg20M7V6", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Change Account Password\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"errors\"]]],null,2],[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Current Password\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"required\"],[\"password\",[\"get\",[\"old_password\"]],\"form-control\",\"required\"]]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"New Password\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"required\"],[\"password\",[\"get\",[\"new_password_1\"]],\"form-control\",\"required\"]]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"profile-heading\"],[\"flush-element\"],[\"text\",\"Confirm New Password\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"required\"],[\"password\",[\"get\",[\"new_password_2\"]],\"form-control\",\"required\"]]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"changePassword\"]],[\"flush-element\"],[\"text\",\"Change Password\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"account\"],null,0],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                            Cancel\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"error\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"error\"]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-danger\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"errors\"]]],null,1],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/account/change-password.hbs" } });
});
define("impact-public/templates/account/details", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "KTtbsbpC", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"alerts\"]]],null,20],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Account Details\"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Name\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"edit\"]]],null,18,17],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"edit\"]]],null,16,15],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Email\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"edit\"]]],null,13,12],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Address\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"edit\"]]],null,11,10],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Phone Number\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"edit\"]]],null,6,5],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"account-details-section\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"edit\"]]],null,2,0],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"updateAccount\"]],[\"flush-element\"],[\"text\",\"Save\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancel\"]],[\"flush-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                Change Password\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"edit\"]],[\"flush-element\"],[\"text\",\"Edit\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"account.change-password\"],null,1]],\"locals\":[]},{\"statements\":[[\"text\",\"                                No phone number has been saved\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"append\",[\"unknown\",[\"model\",\"phone\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"model\",\"phone\"]]],null,4,3]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"phone-number-input\"],null,[[\"type\",\"value\",\"class\",\"extensions\",\"disabled\"],[\"text\",[\"get\",[\"model\",\"phone\"]],\"form-control\",false,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                No address has been saved\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"append\",[\"unknown\",[\"model\",\"billing_address2\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"address\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"unknown\",[\"model\",\"billing_address\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"billing_address2\"]]],null,8],[\"text\",\"                                    \"],[\"append\",[\"unknown\",[\"model\",\"billing_city\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"model\",\"billing_state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"model\",\"billing_postal_code\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"model\",\"billing_address\"]]],null,9,7]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"model\",\"billing_address\"]],\"Billing Address\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"model\",\"billing_address2\"]],\"Billing Address 2\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"model\",\"billing_city\"]],\"City\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"state-select\"],null,[[\"selectedState\",\"disabled\",\"class\"],[[\"get\",[\"model\",\"billing_state\"]],[\"get\",[\"loading\"]],\"form-control\"]]],false],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"zip-code-input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\",\"fullCode\"],[\"text\",[\"get\",[\"model\",\"billing_postal_code\"]],\"Zip\",\"form-control\",[\"get\",[\"loading\"]],false]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"model\",\"email\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"email-input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"model\",\"email\"]],\"email\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Business Name:\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"unknown\",[\"model\",\"business\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"model\",\"business\"]]],null,14]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Business Name:\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[\"get\",[\"model\",\"business\"]],[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"model\",\"first_name\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"model\",\"last_name\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form form-inline\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"model\",\"first_name\"]],\"First Name\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"disabled\"],[\"text\",\"form-control\",[\"get\",[\"model\",\"last_name\"]],[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"alert\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"alert\"]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-warning alert-dismissible\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Please check the following:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"alerts\"]]],null,19],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/account/details.hbs" } });
});
define("impact-public/templates/account/donations", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "LIYaDjJa", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"viewingReceipt\"]]],null,22,2],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                \"],[\"append\",[\"helper\",[\"view-receipt\"],null,[[\"transaction\",\"donations\",\"action\"],[[\"get\",[\"transaction\"]],[\"get\",[\"receipt\"]],\"seeAll\"]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                Loading receipt...\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"loadingReceipt\"]]],null,1,0]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"append\",[\"helper\",[\"recurring-donation-row\"],null,[[\"recurringDonation\",\"disable\"],[[\"get\",[\"canceledRecurringDonation\"]],[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"canceledRecurringDonation\"]},{\"statements\":[[\"text\",\"                                        \"],[\"append\",[\"helper\",[\"recurring-donation-row\"],null,[[\"recurringDonation\",\"action\",\"disable\"],[[\"get\",[\"recurringDonation\"]],\"cancelRecurring\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"recurringDonation\"]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"table-responsive\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-hover\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"ID\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITY\"]],false],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"Amount\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"Interval\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"active_recurring_donations\"]]],null,4],[\"block\",[\"each\"],[[\"get\",[\"canceled_recurring_donations\"]]],null,3],[\"text\",\"                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Could not retrieve information please try again.\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-warning\"],[\"flush-element\"],[\"text\",\"Your card is expiring soon. Please update your card to continue your donations.\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"cardExpiringSoon\"]]],null,7],[\"text\",\"                                        \"],[\"open-element\",\"table\",[]],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"blue\"],[\"flush-element\"],[\"text\",\"Card Type:\"],[\"close-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"cardBrand\"]],false],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"blue\"],[\"flush-element\"],[\"text\",\"Card Ending In:\"],[\"close-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"cardLast4\"]],false],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"blue\"],[\"flush-element\"],[\"text\",\"Expiration:\"],[\"close-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"cardExpMonth\"]],false],[\"text\",\"/\"],[\"append\",[\"unknown\",[\"cardExpYear\"]],false],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n\\n                                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue small\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showUpdateCard\"]],[\"flush-element\"],[\"text\",\"Update Card\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"customerInfoAvailable\"]]],null,8,6]],\"locals\":[]},{\"statements\":[[\"text\",\"                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 pull-right\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancelUpdateCard\"]],[\"flush-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"static-attr\",\"type\",\"submit\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"flush-element\"],[\"text\",\"Update Card\"],[\"close-element\"],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 pull-right\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Updating Card...\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"progress\"],[\"flush-element\"],[\"text\",\"\\n                                                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"progress-bar progress-bar-striped active\"],[\"static-attr\",\"role\",\"progressbar\"],[\"static-attr\",\"aria-valuenow\",\"100\"],[\"static-attr\",\"aria-valuemin\",\"0\"],[\"static-attr\",\"aria-valuemax\",\"100\"],[\"static-attr\",\"style\",\"width: 100%\"],[\"flush-element\"],[\"text\",\"\\n                                                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"sr-only\"],[\"flush-element\"],[\"text\",\"Processing\"],[\"close-element\"],[\"text\",\"\\n                                                                \"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"close-element\"],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"card-column\"],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"card-container\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"id\",\"cardForm\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"updateCard\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Name on Card:\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"name\",\"text\",[\"get\",[\"cardName\"]],\"Name on card\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Card Number:\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"number\",\"text\",[\"get\",[\"cardNumber\"]],\"Card Number\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Exp. Date:\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"expiry\",\"text\",[\"get\",[\"expirationDate\"]],\"MM / YYYY\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"CVC:\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"cvc\",\"text\",[\"get\",[\"cvc\"]],\"CVC\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Zip:\"],[\"close-element\"],[\"text\",\"\\n                                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"id\",\"name\",\"maxlength\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"zip\",\"zip\",\"5\",\"text\",[\"get\",[\"zip\"]],\"Zip\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                                        \"],[\"close-element\"],[\"text\",\"\\n                                                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"loading\"]]],null,11,10],[\"text\",\"                                                \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"credit-card\"],null,[[\"form\",\"cardContainer\"],[\"#cardForm\",\"#card-container\"]],12]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"updatingCard\"]]],null,13,9]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Loading customer info...\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"No Donations\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"label label-warning\"],[\"flush-element\"],[\"text\",\"Refunded on \"],[\"append\",[\"helper\",[\"pretty-date\"],[[\"get\",[\"donation\",\"refund_created\"]]],null],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"muted glyphicon glyphicon-refresh\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"donation\",\"id\"]],false],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"donation\",\"date\"]],\"MM/DD/YYYY\"],null],false],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n                                                $\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"donation\",\"total\"]]],null],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"recurring_id\"]]],null,18],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"refunded\"]]],null,17],[\"text\",\"                                            \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"viewReceipt\",[\"get\",[\"donation\",\"transaction_id\"]]]],[\"flush-element\"],[\"text\",\"View\"],[\"close-element\"],[\"text\",\" / \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"getReceipt\",[\"get\",[\"donation\",\"transaction_id\"]]]],[\"flush-element\"],[\"text\",\"Email\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"table-responsive\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-hover\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITY\"]],false],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"Donation ID\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"Date\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"Amount\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"Receipt\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sortedDonations\"]]],null,19,16],[\"text\",\"                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"nav\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"pagination\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"li\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasLessPages\"]],\"disabled\"],null]]]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"aria-label\",\"Previous\"],[\"dynamic-attr\",\"disabled\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasLessPages\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"getFirst\"]],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"«\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"li\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasLessPages\"]],\"disabled\"],null]]]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"disabled\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasLessPages\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"getPrevious\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-chevron-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"li\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasMorePages\"]],\"disabled\"],null]]]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"disabled\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasMorePages\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"getNext\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-chevron-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"li\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasMorePages\"]],\"disabled\"],null]]]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"aria-label\",\"Next\"],[\"dynamic-attr\",\"disabled\",[\"concat\",[[\"helper\",[\"unless\"],[[\"get\",[\"hasMorePages\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"getLast\"]],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"»\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-spinner sk-spinner-fading-circle\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle1 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle2 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle3 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle4 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle5 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle6 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle7 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle8 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle9 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle10 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle11 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle12 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                \"],[\"comment\",\" Nav tabs \"],[\"text\",\"\\n                \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav nav-tabs\"],[\"static-attr\",\"role\",\"tablist\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"role\",\"presentation\"],[\"static-attr\",\"class\",\"active\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#donations\"],[\"static-attr\",\"aria-controls\",\"donations\"],[\"static-attr\",\"role\",\"tab\"],[\"static-attr\",\"data-toggle\",\"tab\"],[\"flush-element\"],[\"text\",\"Donations\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"role\",\"presentation\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#recurring-donations\"],[\"static-attr\",\"aria-controls\",\"recurring-donations\"],[\"static-attr\",\"role\",\"tab\"],[\"static-attr\",\"data-toggle\",\"tab\"],[\"flush-element\"],[\"text\",\"Manage Recurring Donations\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"comment\",\" Tab panes \"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"tab-content\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"comment\",\" Donations \"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"role\",\"tabpanel\"],[\"static-attr\",\"class\",\"tab-pane active\"],[\"static-attr\",\"id\",\"donations\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Recent Donations\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"loading\"]]],null,21,20],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"comment\",\" Recurring Donations \"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"role\",\"tabpanel\"],[\"static-attr\",\"class\",\"tab-pane\"],[\"static-attr\",\"id\",\"recurring-donations\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Recurring Donations\"],[\"close-element\"],[\"text\",\"\\n\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-info\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"h6\",[]],[\"static-attr\",\"class\",\"lt-blue\"],[\"flush-element\"],[\"text\",\"Card Information\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"text\",\"This card will be used for all future recurring donations.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"loadingCustomerInfo\"]]],null,15,14],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"updatingCard\"]]],null,5],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/account/donations.hbs" } });
});
define("impact-public/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "rMAjEnqS", "block": "{\"statements\":[[\"append\",[\"helper\",[\"growl-notifications-manager\"],null,[[\"notifications\"],[[\"get\",[\"growl\",\"notifications\"]]]]],false],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,1],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,0],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"footer no-print\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"p-small-white\"],[\"flush-element\"],[\"text\",\"Copyright 2017 Impact Institute. All rights reserved.\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"append\",[\"helper\",[\"main-nav\"],null,[[\"donations\",\"isGHD\",\"user\",\"action\"],[[\"get\",[\"sortedDonations\"]],[\"get\",[\"isGHD\"]],[\"get\",[\"user\"]],\"scrollTo\"]]],false],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/application.hbs" } });
});
define("impact-public/templates/charity-list", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1PyeTsSM", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"margin-top:10px\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"append\",[\"unknown\",[\"charity-list\"]],false],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/charity-list.hbs" } });
});
define("impact-public/templates/charity", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "FdQ3OxRz", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-profile\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"back-button\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"home\"],null,32],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 col-md-push-3 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-story\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-name\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"isHighImpact\"]]],null,31],[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"model\",\"name\"]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"logo\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"model\",\"https_logo\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,30],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"text\",\"                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Summary\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"summary\"]],false],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"append\",[\"helper\",[\"charity-campaigns\"],null,[[\"campaigns\",\"charity\",\"save\"],[[\"get\",[\"campaigns\"]],[\"get\",[\"model\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"saveDonationCampaign\"],null]]]],false],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"LABELS\",\"OUR\"]],false],[\"text\",\" Story\"],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"story\"]],false],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"videoUrl\"]]],null,25],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,24],[\"block\",[\"unless\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,21],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,18],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-md-push-3 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-right-sidebar\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"donate_access\"]]],null,16],[\"block\",[\"if\"],[[\"get\",[\"volunteerOpportunities\"]]],null,9],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-md-pull-9 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-left-sidebar\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profile-image\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"model\",\"https_image\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,7],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,4],[\"block\",[\"if\"],[[\"get\",[\"model\",\"website\"]]],null,2],[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profile-section\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"social\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"facebook_url\"]]],null,1],[\"block\",[\"if\"],[[\"get\",[\"model\",\"twitter_url\"]]],null,0],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"target\",\"_blank\"],[\"dynamic-attr\",\"href\",[\"concat\",[[\"unknown\",[\"model\",\"twitter_url\"]]]]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon icon-twitter\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"target\",\"_blank\"],[\"dynamic-attr\",\"href\",[\"concat\",[[\"unknown\",[\"model\",\"facebook_url\"]]]]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon icon-facebook2\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profile-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Website\"],[\"close-element\"],[\"text\",\"\\n\\n                            \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"href\",[\"concat\",[[\"unknown\",[\"formattedWebsite\"]]]]],[\"static-attr\",\"target\",\"_blank\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"website\"]],false],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    Toll Free: \"],[\"append\",[\"unknown\",[\"model\",\"phone_toll_free\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profile-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Phone\"],[\"close-element\"],[\"text\",\"\\n\\n                            \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                                Local: \"],[\"append\",[\"unknown\",[\"model\",\"phone_local\"]],false],[\"text\",\" \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"phone_toll_free\"]]],null,3],[\"text\",\"                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profile-section\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Mailing Address\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"unknown\",[\"model\",\"mailing_street\"]],false],[\"text\",\"\\n                                \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"unknown\",[\"model\",\"mailing_city\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"model\",\"mailing_state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"model\",\"mailing_postal_code\"]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"category-icon\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"helper\",[\"charity-symbol\"],null,[[\"typeId\",\"title\",\"showTooltip\"],[[\"get\",[\"type\",\"id\"]],[\"get\",[\"type\",\"name\"]],true]]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"type\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"categories\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Focus Area\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"typeObjects\"]]],null,6],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profile-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Street Address\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"address\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"unknown\",[\"model\",\"street_street\"]],false],[\"text\",\"\\n                                \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"unknown\",[\"model\",\"street_city\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"model\",\"street_state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"model\",\"street_postal_code\"]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"mailing_street\"]]],null,5]],\"locals\":[]},{\"statements\":[[\"text\",\"See\\n                            Opportunities\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-list\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Volunteer\"],[\"close-element\"],[\"text\",\"\\n\\n                        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"There are currently \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"volunteer-count\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"volunteerOpportunitiesLength\"]],false],[\"close-element\"],[\"text\",\"\\n                            volunteer opportunities.\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"block\",[\"link-to\"],[\"volunteer\",[\"helper\",[\"query-params\"],null,[[\"charity\"],[[\"get\",[\"model\",\"id\"]]]]]],[[\"class\"],[\"btn-primary btn-lt-red\"]],8],[\"text\",\"\\n\"],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                      \"],[\"append\",[\"helper\",[\"donation-thermometer\"],null,[[\"donations\",\"goal\"],[[\"get\",[\"donations\"]],[\"get\",[\"model\",\"goal_amount\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue small\"],[\"flush-element\"],[\"text\",\"View Cart\\n                                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"checkout\"],null,11]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"suggestion\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n                                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"suggested-donation-amount\"],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"suggestion\",\"amount\"]]],null],false],[\"close-element\"],[\"text\",\"\\n                                                \"],[\"close-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                                                    \"],[\"append\",[\"unknown\",[\"suggestion\",\"description\"]],false],[\"text\",\"\\n                                                \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-blue small\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addToCart\",[\"get\",[\"suggestion\",\"amount\"]],true]],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-plus\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Add to Cart\\n                                            \"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"suggestion\"]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"suggested-donation\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"donationSuggestions\"]]],null,13],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"donationSuggestions\"]]],null,14]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"LABELS\",\"DONATION_SLOGAN\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,15],[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"custom-donation\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Enter Your Donation\"],[\"close-element\"],[\"text\",\"\\n\\n                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"amount\"]],\"form-control\",11]]],false],[\"text\",\"\\n\"],[\"text\",\"                                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue small\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addToCart\",[\"get\",[\"amount\"]]]],[\"flush-element\"],[\"text\",\" Add to Cart\\n                                \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hasDonations\"]]],null,12],[\"text\",\"                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_lah_app\"]]],null,10]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"helper\",[\"opentr\"],[[\"get\",[\"idx\"]]],null],false],[\"text\",\"\\n                            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"member\",\"name\"]],false],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"open-element\",\"em\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"member\",\"title\"]],false],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"closetr\"],[[\"get\",[\"idx\"]]],null],false],[\"text\",\"\\n\"]],\"locals\":[\"member\",\"idx\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row board-information\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Our Board\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"table\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"allBoardMembers\"]]],null,17],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"append\",[\"helper\",[\"donation-comment\"],null,[[\"comment\"],[[\"get\",[\"comment\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"comment\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Comments\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation-comments\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sortedComments\"]]],null,19],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"sortedComments\"]]],null,20]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"   \\n                                \"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"href\",[\"concat\",[[\"unknown\",[\"pdfDocument\",\"document_url\"]]]]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-link\"],[\"flush-element\"],[\"close-element\"],[\"append\",[\"unknown\",[\"pdfDocument\",\"document_name\"]],false],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"pdfDocument\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Campaign Information\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"organizationDocuments\"]]],null,22],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"organizationDocuments\"]]],null,23]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"append\",[\"helper\",[\"video-frame\"],null,[[\"source\"],[[\"get\",[\"model\",\"videoUrl\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"append\",[\"unknown\",[\"location\",\"city\"]],false],[\"text\",\",\\n                                    \"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"location\",\"city\"]]],null,26]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"append\",[\"unknown\",[\"location\",\"county\"]],false],[\"text\",\" County,\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-map-marker\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"location\",\"county\"]]],null,28,27],[\"text\",\"                                    \"],[\"append\",[\"unknown\",[\"location\",\"state\"]],false],[\"text\",\"\\n                                    \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"location\"]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"location\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"locations\"]]],null,29],[\"text\",\"                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"high-impact\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Back to All \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITIES\"]],false],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/charity.hbs" } });
});
define("impact-public/templates/checkout", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QKfLGx+L", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-print\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"ghd\",\"isGHD\"]]],null,1,0],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Checkout\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header ghd\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Checkout\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/checkout.hbs" } });
});
define("impact-public/templates/checkout/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "dUMQSilS", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"ol\",[]],[\"static-attr\",\"class\",\"wizard-progress clearfix\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"1\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name-active\"],[\"flush-element\"],[\"text\",\"\\n                            Review\\n                        \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"2\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"3\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Payment\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"4\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Thank You\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"alerts\"]]],null,14],[\"text\",\"\\n\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\"]]],null,12,11],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\"]]],null,10]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-width\"],[\"flush-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"small-print\"],[\"flush-element\"],[\"text\",\"\\n                 \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                     \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"If you would like to designate your donation to a specific program within the organization please contact the \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITY\"]]],null],false],[\"text\",\" directly.\"],[\"close-element\"],[\"text\",\"\\n                 \"],[\"close-element\"],[\"text\",\"\\n             \"],[\"close-element\"],[\"text\",\"\\n         \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-refresh\"],[\"static-attr\",\"data-toggle\",\"tooltip\"],[\"static-attr\",\"data-placement\",\"top\"],[\"static-attr\",\"title\",\"Monthly Donation\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Recurring Monthly\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"bootstrap-tooltip\"],null,null,1]],\"locals\":[]},{\"statements\":[[\"text\",\"                             $\"],[\"append\",[\"helper\",[\"money-no-cents\"],[[\"get\",[\"cartTotal\"]]],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                             $\"],[\"append\",[\"helper\",[\"money-no-cents\"],[[\"get\",[\"cartTotalWithCharges\"]]],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-left\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"type\",\"checkbox\"],[\"dynamic-attr\",\"checked\",[\"unknown\",[\"recurring\"]],null],[\"dynamic-attr\",\"onclick\",[\"helper\",[\"action\"],[[\"get\",[null]],\"setRecurring\"],[[\"value\"],[\"target.checked\"]]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Make this a monthly recurring donation.\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"text\",\"Recurring donations are a recurring monthly gift to the \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITY\"]]],null],false],[\"text\",\" of your choice.\\n                                    The donation is charged to your card on file once a month for 12 months and then expires.\\n                                    The donation will occur on the same date of the month as the initial donation.\\n                                    You can log into your donor account at any time and cancel a recurring donation.\\n                                    You must create an account to set up recurring giving. You will be prompted to create one,\\n                                    or login if you already have one.\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"unless\"],[[\"get\",[\"ghd\",\"isGHD\"]]],null,5]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"onlyOneDonationInCart\"]]],null,6]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"unknown\",[\"processingCharges\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"well well-sm\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"well-style\"],[\"flush-element\"],[\"text\",\"\\n                                Every time you shop or donate with a credit card, the merchant or organization is charged a small percentage of the sale for card processors to manage the transaction. Merchants factor these expenses into their cost of doing business. You can agree to generously offset these costs for \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITY\"]],false],[\"text\",\"!\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-t\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                These charges allow your gift to go directly and quickly to the \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITIES\"]]],null],false],[\"text\",\" you’ve supported to power their important missions.\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"text-right\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleExplanation\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Close\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"comment\",\"Fees\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-width\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row processing-fee\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-left\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"track-checkbox\"],null,[[\"category\",\"action\",\"label\",\"selected\",\"trackOn\"],[\"Donation\",\"processing-fee\",\"not-paid\",[\"get\",[\"payProcessingCharges\"]],false]]],false],[\"text\",\"\\n                                Yes, I would like to increase my donation by 2.9% + $0.30 in order to offset credit card processing fees.\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-question-sign\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleExplanation\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"explanation\"]]],null,9],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"payProcessingCharges\"]]],null,8],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"comment\",\" Recurring \"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-width\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,7],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-width\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"total-text\"],[\"flush-element\"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Total\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showCartWithCharges\"]]],null,4,3],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"recurring\"]]],null,2],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-width marg-t\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-buttons\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"donate\"]],[\"flush-element\"],[\"text\",\"Add Another Donation\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"keepGoing\"]],[\"flush-element\"],[\"text\",\"Continue to Checkout\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,0],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row cart-width\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-items\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"You have no items in your cart. \"],[\"close-element\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"donate\"]],[\"flush-element\"],[\"text\",\"Donate Now\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"append\",[\"helper\",[\"customize-donation\"],null,[[\"donation\",\"action\"],[[\"get\",[\"donation\"]],\"removeDonation\"]]],false],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"alert\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"alert\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-warning\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Please check the following:\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"alerts\"]]],null,13],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/checkout/index.hbs" } });
});
define("impact-public/templates/checkout/review", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "y9gGiuLA", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"alerts\"]]],null,43],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"errors\"]]],null,41],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donationsSucceeded\"]]],null,39],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showShareOptions\"]]],null,38,21]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red float-right\"],[\"static-attr\",\"type\",\"submit\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"flush-element\"],[\"text\",\"\\n                                Make\\n                                Payment\\n                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"statement-warning\"],[\"flush-element\"],[\"open-element\",\"em\",[]],[\"flush-element\"],[\"text\",\"Please note that this charge will show up on statements as a payment to \"],[\"append\",[\"unknown\",[\"LABELS\",\"PAYMENT_NAME\"]],false],[\"text\",\".\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"refund-lah\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"refund-impact\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"card-column\"],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"card-container\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 marg-t\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"cardForm\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Name on Card:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"name\",\"text\",[\"get\",[\"cardName\"]],\"Name on card\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Card Number:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"number\",\"text\",[\"get\",[\"cardNumber\"]],\"Card Number\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Exp. Date:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"expiry\",\"text\",[\"get\",[\"expirationDate\"]],\"MM / YYYY\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"CVC:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"cvc\",\"text\",[\"get\",[\"cvc\"]],\"CVC\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Billing Address:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"address1\",\"text\",[\"get\",[\"address1\"]],\"Address 1\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"address2\",\"text\",[\"get\",[\"address2\"]],\"Address 2\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"City:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"city\",\"text\",[\"get\",[\"city\"]],\"City\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"State:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"state-select\"],null,[[\"selectedState\",\"disabled\"],[[\"get\",[\"state\"]],[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Zip Code:\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"name\",\"value\",\"maxlength\",\"placeholder\",\"required\",\"class\",\"disabled\"],[\"zip\",[\"get\",[\"zip\"]],\"7\",\"Zip/Postal\",\"required\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Mr. Matchy Matchy Code + Org. Name (Optional)\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"couponcode\"]],\"Coupon Code\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\"],[\"checkbox\",[\"get\",[\"ghd_email_opt_in\"]]]]],false],[\"text\",\" I would like to receive emails with Giving Hearts Day information from DMF\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\"],[\"checkbox\",[\"get\",[\"willmatch\"]]]]],false],[\"text\",\" My employer will match this gift\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                              \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                  \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\"],[\"checkbox\",[\"get\",[\"newghddonor\"]]]]],false],[\"text\",\" I'm a New Giving Hearts Day Donor\\n                              \"],[\"close-element\"],[\"text\",\"\\n                          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"small\"],[\"flush-element\"],[\"text\",\"If checked, your contact information will not be provided to the \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITIES\"]]],null],false],[\"text\",\".\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Email:\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"required\",\"class\",\"disabled\"],[\"email\",[\"get\",[\"guestEmail\"]],\"someone@example.com\",\"required\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                              \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"secondFirstName\"]],\"Additional Name\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            + Add an additional donor name\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            - Remove additional donor name\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n                \"],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"text\",\"Checking out as guest\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-white medium\"],[\"flush-element\"],[\"text\",\"Edit Cart\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"processing-fee\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-label percent-callout-payment\"],[\"flush-element\"],[\"text\",\"\\n                            Credit Card Processing Fee\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"amount\"],[\"flush-element\"],[\"text\",\"\\n                            $\"],[\"append\",[\"unknown\",[\"cart\",\"processingCharges\"]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"append\",[\"helper\",[\"donation-cart\"],null,[[\"donation\"],[[\"get\",[\"donation\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Processing Payment...\"],[\"close-element\"],[\"text\",\"\\n\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"progress\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"progress-bar progress-bar-striped active\"],[\"static-attr\",\"role\",\"progressbar\"],[\"static-attr\",\"aria-valuenow\",\"100\"],[\"static-attr\",\"aria-valuemin\",\"0\"],[\"static-attr\",\"aria-valuemax\",\"100\"],[\"static-attr\",\"style\",\"width: 100%\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"sr-only\"],[\"flush-element\"],[\"text\",\"Processing\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"2\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Sign In\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"2\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"block\",[\"link-to\"],[\"signin\"],null,19],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-10 hidden-xs no-print\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"ol\",[]],[\"static-attr\",\"class\",\"wizard-progress clearfix\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"1\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"\\n                    Review\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"guest\"]]],null,20,18],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"3\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name-active\"],[\"flush-element\"],[\"text\",\"Payment\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"4\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Thank You\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isProcessingPayment\"]]],null,17],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"row \",[\"helper\",[\"if\"],[[\"get\",[\"isProcessingPayment\"]],\"obscure\"],null]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 cart-payment\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"class\",\"white\"],[\"flush-element\"],[\"text\",\"Cart\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"content\"]]],null,16],[\"block\",[\"if\"],[[\"get\",[\"cart\",\"payProcessingCharges\"]]],null,15],[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"total\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-label\"],[\"flush-element\"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"class\",\"white\"],[\"flush-element\"],[\"text\",\"Total\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"amount\"],[\"flush-element\"],[\"text\",\" $\"],[\"append\",[\"helper\",[\"money-no-cents\"],[[\"get\",[\"cart\",\"totalWithCharges\"]]],null],false],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"edit\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"checkout\"],null,14],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9 payment-form\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"class\",\"blue\"],[\"flush-element\"],[\"text\",\"Contact Info \"],[\"block\",[\"if\"],[[\"get\",[\"guest\"]]],null,13],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"makePayment\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"First Name:\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"text\",[\"get\",[\"firstName\"]],\"First Name\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"text\",\"                        \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleSecondFirstName\"]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"addSecondFirstName\"]]],null,12,11],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"addSecondFirstName\"]]],null,10],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Last Name:\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"text\",[\"get\",[\"lastName\"]],\"Last Name\",\"form-control\",\"required\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Phone:\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"phone-number-input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"id\",\"disabled\",\"extensions\"],[\"text\",[\"get\",[\"phone\"]],\"Phone\",\"form-control\",\"required\",\"phone\",[\"get\",[\"loading\"]],false]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"guest\"]]],null,9],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"name\",\"checked\"],[\"checkbox\",\"anonymous\",[\"get\",[\"anonymousDonation\"]]]]],false],[\"text\",\" Make my donations anonymous\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"anonymousDonation\"]]],null,8],[\"block\",[\"if\"],[[\"get\",[\"manageGHD\",\"isGHD\"]]],null,7],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,6],[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\"],[\"checkbox\",[\"get\",[\"isgift\"]]]]],false],[\"text\",\" This is a business gift\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,5],[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Business Name (optional)\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"disabled\"],[\"text\",[\"get\",[\"business\"]],\"Business name\",\"form-control\",[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGHD\",\"isGHD\"]]],null,4],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"text\",\"                \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"class\",\"blue\"],[\"flush-element\"],[\"text\",\"Payment Info\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"comment\",\"<p class=\\\"info\\\">All recurring donations will use the card you enter for future donations, including\\n                    those set previously with a different card.</p>\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"text\",\"We accept Visa, Mastercard and Discover.\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"credit-card\"],null,[[\"form\",\"cardContainer\"],[\"#cardForm\",\"#card-container\"]],3],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row cart-review\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 marg-t\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,2,1],[\"block\",[\"unless\"],[[\"get\",[\"loading\"]]],null,0],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"href\",\"http://twitter.com/share?text=I+gave+on+%23givingheartsday\"],[\"static-attr\",\"target\",\"_blank\"],[\"flush-element\"],[\"text\",\"Share on Twitter\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row-fluid\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-box\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-header\"],[\"flush-element\"],[\"text\",\"Facebook \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-facebook\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"I am a Giving Heart! Join me at impactgiveback.org. #givinghearts17\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"facebookShare\"]],[\"flush-element\"],[\"text\",\"Share on facebook\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-box\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-header\"],[\"flush-element\"],[\"text\",\"Twitter \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-twitter\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"I gave on #givinghearts17 !\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to-track\"],null,[[\"category\",\"action\"],[\"share\",\"twitter\"]],22],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-box\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-header\"],[\"flush-element\"],[\"text\",\"e-card\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Share Giving Hearts Day with your friends! Send an e-card to someone special.\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleEcard\"]],[\"flush-element\"],[\"text\",\"Send an e-card\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"append\",[\"helper\",[\"e-card\"],null,[[\"donations\",\"action\"],[[\"get\",[\"receiptDonations\"]],\"toggleEcard\"]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-print\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"share-subheader pad-t\"],[\"flush-element\"],[\"text\",\"\\n                    Share\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Tell your friends and followers you are a Giving Heart! Use your social media accounts to spread the\\n                    Giving Hearts Day love. Let’s make #givingheartsday trend!\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showEcard\"]]],null,24,23],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                Back to Home\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleViewReceipt\"]],[\"flush-element\"],[\"text\",\"View Receipt\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"You can also see it below.\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"We will email you a receipt. \"],[\"block\",[\"unless\"],[[\"get\",[\"guest\"]]],null,28],[\"close-element\"],[\"text\",\"\\n                \"],[\"block\",[\"unless\"],[[\"get\",[\"guest\"]]],null,27],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Loading receipt...\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"loadingReceipt\"]]],null,30,29],[\"block\",[\"link-to\"],[\"home\"],null,26]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"append\",[\"helper\",[\"view-receipt\"],null,[[\"transaction\",\"donations\",\"action\"],[[\"get\",[\"transaction\"]],[\"get\",[\"transaction_donations\"]],\"toggleViewReceipt\"]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\".\"]],\"locals\":[]},{\"statements\":[[\"text\",\" on Giving Hearts Day!\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"2\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Sign In\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"2\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"block\",[\"link-to\"],[\"signin\"],null,36],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-10 hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"ol\",[]],[\"static-attr\",\"class\",\"wizard-progress clearfix no-print\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"1\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"\\n                    Review\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"guest\"]]],null,37,35],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"3\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Payment\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"4\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name-active\"],[\"flush-element\"],[\"text\",\"Thank You\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-10\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-print\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Thank You!\"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Thank you for your generous act of kindness\"],[\"block\",[\"if\"],[[\"get\",[\"manageGHD\",\"isGHD\"]]],null,34,33],[\"text\",\"\\n                You’ve shared your belief in the important work of nonprofits changing the world for the better. On\\n                behalf of the \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITY\"]]],null],false],[\"text\",\" mission you’ve supported, the lives you’ve touched and from us … we extend a\\n                hug.\"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-b\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"viewReceipt\"]]],null,32,31],[\"block\",[\"if\"],[[\"get\",[\"manageGHD\",\"isGHD\"]]],null,25],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row no-print\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-10\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-success\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Your donations completed successfully.\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"error\"]],true],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"error\"]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row no-print\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-10\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-danger\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Something went wrong with your charge:\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"errors\"]]],null,40],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"alert\"]],true],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"alert\"]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row no-print\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-10\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-warning\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Please check the following:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"alerts\"]]],null,42],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/checkout/review.hbs" } });
});
define("impact-public/templates/components/bootstrap-tooltip", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "y4SRU9a6", "block": "{\"statements\":[[\"yield\",\"default\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/bootstrap-tooltip.hbs" } });
});
define("impact-public/templates/components/charity-box-lah", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "u80bYWZ2", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row nonprofit-section\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nonprofit-title\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-10\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,35,34],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-2 hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"charity\",\"types\"]]],null,32],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 hidden-md hidden-sm hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,31,30],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-6 col-md-9\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"charity\",\"https_logo\"]]]]],[\"static-attr\",\"class\",\"img-responsive nonprofit-logo\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"locations-group\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"charity\",\"locations\"]]],null,28],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-9 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-content\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,24,22],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 col-md-3 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-buttons\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"block\",[\"if\"],[[\"get\",[\"donationAdded\"]]],null,21,16],[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,9,6],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,4],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,2],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-9 col-md-9 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"charity-extended-story\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"charity\",\"ghd_story\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-9 col-md-9 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"charity-extended-story\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"charity\",\"ghd_story\"]],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"video-frame\"],null,[[\"source\",\"width\",\"height\"],[[\"get\",[\"charity\",\"ghdVideoUrl\"]],500,281]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"learn-more-expanded\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghdVideoUrl\"]]],null,1,0],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 col-lg-offset-9 col-md-3 col-md-offset-9 col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-buttons\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleLearnMore\"]],[\"flush-element\"],[\"text\",\"\\n          Hide Details\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"../images/high_impact.png\"],[\"static-attr\",\"class\",\"high-impact-ghd\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"isHighImpact\"]]],null,3],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" Learn More \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"link-to\"],[\"charity\",[\"get\",[\"charity\",\"id\"]]],[[\"class\"],[\"btn-secondary btn-red medium\"]],5],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" Learn More \"]],\"locals\":[]},{\"statements\":[[\"text\",\" Hide Details \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red medium marg-b\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleLearnMore\",[\"get\",[\"charity\",\"name\"]]]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,8,7],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n              \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Donation must be at least $10.00\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addToCart\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"form-group \",[\"unknown\",[\"has-error\"]]]]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"custom\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"amount\"]],\"form-control\",11]]],false],[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"has-error\"]]],null,10],[\"text\",\"              \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red small\"],[\"static-attr\",\"type\",\"submit\"],[\"flush-element\"],[\"text\",\"Add To Cart\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Additional options at checkout\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleIsDonating\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"donate_access\"]]],null,12],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleIsDonating\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghd_access\"]]],null,14],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,15,13],[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"isDonating\"]]],null,11],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"makeAnother\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"donate_access\"]]],null,17],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"makeAnother\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghd_access\"]]],null,19],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,20,18],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"center\"],[\"flush-element\"],[\"text\",\"Donation Added to Cart\"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-small-link\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"link-to-track\"],null,[[\"class\",\"link-to\",\"link-text\",\"category\",\"action\",\"label\"],[\"marg-r\",\"checkout\",\"Checkout\",\"cart\",\"checkout\",\"nonprofit-panel\"]]],false],[\"text\",\"\\n        | \"],[\"append\",[\"helper\",[\"link-to-track\"],null,[[\"class\",\"link-to\",\"link-text\",\"category\",\"action\",\"label\"],[\"marg-l\",\"checkout\",\"Edit Cart\",\"cart\",\"edit\",\"nonprofit-panel\"]]],false],[\"text\",\"\\n\"],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n      \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"charity\",\"summary\"]],false],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"suggested\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"red\"],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"charity\",\"ghd_donation_suggestion\",\"amount\"]]],null],false],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"charity\",\"ghd_donation_suggestion\",\"description\"]],false],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red small\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addDonationSuggestionToCart\"]],[\"flush-element\"],[\"text\",\"Add to cart\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"charity\",\"ghd_summary\"]],false],[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghd_donation_suggestion\"]]],null,23],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"location\",\"city\"]],false],[\"text\",\", \"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"location\",\"city\"]]],null,25]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"location\",\"county\"]],false],[\"text\",\" County, \"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nonprofit-location\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-map-marker\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"block\",[\"if\"],[[\"get\",[\"location\",\"county\"]]],null,27,26],[\"text\",\" \"],[\"append\",[\"unknown\",[\"location\",\"state\"]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"location\"]},{\"statements\":[[\"text\",\"\\n    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive nonprofit-image\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"charity\",\"https_image\"]],null],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"link-to\"],[\"charity\",[\"get\",[\"charity\",\"id\"]]],[[\"class\"],[\"\"]],29],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive nonprofit-image\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"charity\",\"https_image\"]],null],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"icons-category\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"charity-symbol\"],null,[[\"typeId\",\"title\",\"showTooltip\"],[[\"get\",[\"type\",\"id\"]],[\"get\",[\"type\",\"name\"]],true]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"type\"]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"charity\",\"name\"]],false],[\"text\",\"\\n        \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"link-to\"],[\"charity\",[\"get\",[\"charity\",\"id\"]]],[[\"class\"],[\"\"]],33],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"charity\",\"name\"]],false],[\"text\",\" \"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/charity-box-lah.hbs" } });
});
define("impact-public/templates/components/charity-box", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "m6LVUMke", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"charity\",\"_showOnPage\"]]],null,36]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-9 col-md-9 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"charity-extended-story\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"charity\",\"ghd_story\"]],false],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-9 col-md-9 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"charity-extended-story\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"charity\",\"ghd_story\"]],false],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"video-frame\"],null,[[\"source\",\"width\",\"height\"],[[\"get\",[\"charity\",\"ghdVideoUrl\"]],500,281]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"learn-more-expanded\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghdVideoUrl\"]]],null,1,0],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 col-lg-offset-9 col-md-3 col-md-offset-9 col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-buttons\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleLearnMore\"]],[\"flush-element\"],[\"text\",\"\\n                            Hide Details\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"../images/high_impact.png\"],[\"static-attr\",\"class\",\"high-impact-ghd\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"charity\",\"isHighImpact\"]]],null,3]],\"locals\":[]},{\"statements\":[[\"text\",\"                        Learn More\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"charity\",[\"get\",[\"charity\",\"id\"]]],[[\"class\"],[\"btn-secondary btn-red medium\"]],5]],\"locals\":[]},{\"statements\":[[\"text\",\"                            Learn More\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            Hide Details\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red medium marg-b\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleLearnMore\",[\"get\",[\"charity\",\"name\"]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,8,7],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Donation must be at least $10.00\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addToCart\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"form-group \",[\"unknown\",[\"has-error\"]]]]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"custom\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"amount\"]],\"form-control\",11]]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"has-error\"]]],null,10],[\"text\",\"                                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red small\"],[\"static-attr\",\"type\",\"submit\"],[\"flush-element\"],[\"text\",\"Add To Cart\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Additional options at checkout\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleIsDonating\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"charity\",\"donate_access\"]]],null,12]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleIsDonating\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghd_access\"]]],null,14]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,15,13],[\"block\",[\"if\"],[[\"get\",[\"isDonating\"]]],null,11]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"makeAnother\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"charity\",\"donate_access\"]]],null,17]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"makeAnother\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghd_access\"]]],null,19]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,20,18],[\"text\",\"                    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"center\"],[\"flush-element\"],[\"text\",\"Donation Added to Cart\"],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-small-link\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"link-to-track\"],null,[[\"class\",\"link-to\",\"link-text\",\"category\",\"action\",\"label\"],[\"marg-r\",\"checkout\",\"Checkout\",\"cart\",\"checkout\",\"nonprofit-panel\"]]],false],[\"text\",\"\\n                        |\\n                        \"],[\"append\",[\"helper\",[\"link-to-track\"],null,[[\"class\",\"link-to\",\"link-text\",\"category\",\"action\",\"label\"],[\"marg-l\",\"checkout\",\"Edit Cart\",\"cart\",\"edit\",\"nonprofit-panel\"]]],false],[\"text\",\"\\n\"],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"append\",[\"unknown\",[\"charity\",\"summary\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"suggested\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"red\"],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"charity\",\"ghd_donation_suggestion\",\"amount\"]]],null],false],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"charity\",\"ghd_donation_suggestion\",\"description\"]],false],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red small\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addDonationSuggestionToCart\"]],[\"flush-element\"],[\"text\",\"Add to cart\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"append\",[\"unknown\",[\"charity\",\"ghd_summary\"]],false],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"charity\",\"ghd_donation_suggestion\"]]],null,23]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"append\",[\"unknown\",[\"location\",\"city\"]],false],[\"text\",\",\\n                            \"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"location\",\"city\"]]],null,25]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"append\",[\"unknown\",[\"location\",\"county\"]],false],[\"text\",\" County,\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nonprofit-location\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-map-marker\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"location\",\"county\"]]],null,27,26],[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"location\",\"state\"]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"location\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive nonprofit-image\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"charity\",\"https_image\"]],null],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"charity\",[\"get\",[\"charity\",\"id\"]]],[[\"class\"],[\"\"]],29]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive nonprofit-image\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"charity\",\"https_image\"]],null],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"icons-category\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"charity-symbol\"],null,[[\"typeId\",\"title\",\"showTooltip\"],[[\"get\",[\"type\",\"id\"]],[\"get\",[\"type\",\"name\"]],true]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"type\"]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"charity\",\"name\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"charity\",[\"get\",[\"charity\",\"id\"]]],[[\"class\"],[\"\"]],33]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"append\",[\"unknown\",[\"charity\",\"name\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row nonprofit-section\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nonprofit-title\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-10\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,35,34],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-2 hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"charity\",\"types\"]]],null,32],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 hidden-md hidden-sm hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,31,30],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-6 col-md-9\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"charity\",\"https_logo\"]]]]],[\"static-attr\",\"class\",\"img-responsive nonprofit-logo\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"locations-group\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"charity\",\"locations\"]]],null,28],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-9 col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-content\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,24,22],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 col-md-3 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-buttons\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donationAdded\"]]],null,21,16],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,9,6],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isGivingHeartsDay\"]]],null,4],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,2],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/charity-box.hbs" } });
});
define("impact-public/templates/components/charity-campaign", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "MBTw4cC1", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"campaign-container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-8\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"expand\"]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"campaign-title\"],[\"flush-element\"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"campaign\",\"title\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-4 text-right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isExpanded\"]]],null,3,2],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isExpanded\"]]],null,1],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"campaign\",\"image_url\"]]]]],[\"static-attr\",\"class\",\"img-responsive marg-b\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row campaign-expanded\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"campaign\",\"image_url\"]]],null,0],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"append\",[\"unknown\",[\"campaign\",\"description\"]],false],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row marg-t\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-7 marg-t\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"amount\"]],\"form-control\",11]]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5 marg-t\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addToCart\",[\"get\",[\"amount\"]]]],[\"flush-element\"],[\"text\",\"\\n                            Add to Cart\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"expand\"]],[\"flush-element\"],[\"text\",\"\\n                    Donate\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"expand\"]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"close-link\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-minus\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Close\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/charity-campaign.hbs" } });
});
define("impact-public/templates/components/charity-campaigns", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "EOuIfYJu", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"campaigns\"]]],null,1]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"            \"],[\"append\",[\"helper\",[\"charity-campaign\"],null,[[\"campaign\",\"charity\",\"save\"],[[\"get\",[\"campaign\"]],[\"get\",[\"charity\"]],[\"get\",[\"save\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"campaign\"]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"list-group\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Current Campaigns\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sortedCampaigns\"]]],null,0],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/charity-campaigns.hbs" } });
});
define("impact-public/templates/components/charity-list", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ynHcznG6", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-list\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,4,3],[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"orderedGroupedCharities\"]]],null,2],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                              \"],[\"append\",[\"unknown\",[\"charity\",\"name\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"home\",[\"helper\",[\"query-params\"],null,[[\"nameFilterText\"],[[\"get\",[\"charity\",\"name\"]]]]]],[[\"class\"],[\"\"]],0]],\"locals\":[\"charity\"]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-list-section\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"groupedCharity\",\"letter\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"groupedCharity\",\"charities\"]]],null,1],[\"text\",\"                  \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"groupedCharity\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"back-to-list\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Back to main \"],[\"append\",[\"unknown\",[\"LABEL\",\"CHARITY\"]],false],[\"text\",\" page\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"open-element\",\"center\",[]],[\"flush-element\"],[\"text\",\"Participating \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITIES\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/charity-list.hbs" } });
});
define("impact-public/templates/components/charity-symbol", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "4a1pi1qk", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"showTooltip\"]]],null,1,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"title\",[\"concat\",[[\"unknown\",[\"title\"]]]]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"unknown\",[\"icon_class\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"title\",[\"concat\",[[\"unknown\",[\"title\"]]]]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"unknown\",[\"icon_class\"]]]]],[\"static-attr\",\"data-toggle\",\"tooltip\"],[\"static-attr\",\"data-placement\",\"top\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/charity-symbol.hbs" } });
});
define("impact-public/templates/components/checkbox-option", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ghnVYSaO", "block": "{\"statements\":[[\"open-element\",\"input\",[]],[\"static-attr\",\"type\",\"checkbox\"],[\"dynamic-attr\",\"checked\",[\"unknown\",[\"checked\"]],null],[\"dynamic-attr\",\"value\",[\"unknown\",[\"isChecked\"]],null],[\"dynamic-attr\",\"onclick\",[\"helper\",[\"action\"],[[\"get\",[null]],[\"get\",[\"handler\"]],[\"get\",[\"checkbox_value\"]]],[[\"target\"],[[\"get\",[\"parent\"]]]]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"unknown\",[\"text\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/checkbox-option.hbs" } });
});
define("impact-public/templates/components/count-down", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "BI4N69lf", "block": "{\"statements\":[[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"ticker-countdown\"],[\"static-attr\",\"id\",\"the_final_countdown\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/count-down.hbs" } });
});
define("impact-public/templates/components/customize-donation", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "tgnBzP0B", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5 col-sm-4 col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"nonprofit-name\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"campaign_title\"]]],null,8],[\"text\",\"                \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"designate\"],[\"static-attr\",\"role\",\"form\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"designate\"],[\"flush-element\"],[\"text\",\"Special Donation Instructions\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group marg-b\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"key-up\",\"class\",\"rows\",\"placeholder\"],[[\"get\",[\"donation\",\"designation\"]],\"saveDesignation\",\"form-control\",\"2\",\"\"]]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-4 col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"marg-b-none\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form-inline\"],[\"static-attr\",\"role\",\"form\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\",\"change\"],[\"checkbox\",[\"get\",[\"donation\",\"dedicate\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"setDedication\"],null]]]],false],[\"text\",\" Dedicate this donation\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"dedicate\"]]],null,7],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-sm-4 col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showEditAmount\"]]],null,3,2],[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"basic-link marg-t\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"removeDonation\",[\"get\",[\"donation\"]]]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        Remove this donation\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hasError\"]]],null,1],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,0],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"             \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5 col-sm-4 col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"designate\"],[\"flush-element\"],[\"text\",\"Post a message with your donation. (optional)\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group marg-b\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"rows\",\"maxlength\",\"change\"],[[\"get\",[\"donation\",\"comment\"]],\"2\",200,[\"helper\",[\"action\"],[[\"get\",[null]],\"setDonationComment\"],null]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\",\"click\"],[\"checkbox\",[\"get\",[\"donation\",\"hide_comment_donation_amount\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"setDonationHideAmount\"],[[\"value\"],[\"target.checked\"]]]]]],false],[\"text\",\"  Hide Donation Amount\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n             \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"control-label marg-t\"],[\"flush-element\"],[\"text\",\"Donation must be at least $10.00\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-amount\"],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"unknown\",[\"donation\",\"amount\"]],false],[\"text\",\" \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editAmount\",[\"get\",[\"donation\"]]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"input-group \",[\"unknown\",[\"hasError\"]]]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"donation\",\"amount\"]],\"form-control\",11]]],false],[\"text\",\"\\n\"],[\"text\",\"                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue small\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"saveEdit\",[\"get\",[null]]]],[\"flush-element\"],[\"text\",\"OK\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"get\",[\"option\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"option\"]]]],4],[\"text\",\"\\n\"]],\"locals\":[\"option\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"dedicationOptions\"]]],null,5]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group marg-b\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"name\",\"disabled\",\"class\",\"value\",\"action\"],[\"dedication-select\",[\"get\",[\"disabled\"]],\"form-control\",[\"get\",[\"donation\",\"dedicationSelected\"]],\"selectDedication\"]],6],[\"text\",\"                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"onblur\",\"key-up\",\"placeholder\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"donation\",\"dedicationName\"]],\"saveNameNow\",\"saveName\",\"Name here\",\"form-control\",50]]],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"donation\",\"campaign_title\"]],false],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/customize-donation.hbs" } });
});
define("impact-public/templates/components/donation-cart", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "XTHnyLxG", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clearfix\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-label\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"text\",\"\\n                \"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"campaign_title\"]]],null,1],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"amount\"],[\"flush-element\"],[\"text\",\"\\n            $\"],[\"append\",[\"unknown\",[\"donation\",\"amount\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"recurring\"]]],null,0],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-refresh white\"],[\"static-attr\",\"data-toggle\",\"tooltip\"],[\"static-attr\",\"data-placement\",\"top\"],[\"dynamic-attr\",\"title\",[\"concat\",[[\"unknown\",[\"recurringInterval\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    - \"],[\"append\",[\"unknown\",[\"donation\",\"campaign_title\"]],false],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/donation-cart.hbs" } });
});
define("impact-public/templates/components/donation-comment", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "LCdsbh/5", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation-comment\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"comment-meta\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"comment-date\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"pretty-date\"],[[\"get\",[\"comment\",\"date\"]]],null],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    -\\n    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"comment-author\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"block\",[\"if\"],[[\"get\",[\"comment\",\"author\"]]],null,2,1],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \\n    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"comment-donation-amount\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"comment\",\"donationAmount\"]]],null,0],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"comment-text\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"unknown\",[\"comment\",\"comment\"]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        ($\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"comment\",\"donationAmount\"]]],null],false],[\"text\",\")\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\" Anonymous \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"unknown\",[\"comment\",\"author\"]],false],[\"text\",\" \"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/donation-comment.hbs" } });
});
define("impact-public/templates/components/donation-thermometer", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "5k0estm8", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"amount-raised\"],[\"static-attr\",\"style\",\"height: 600px;\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Amount Raised\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"\\n      Total Donations \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"donations\",\"donationsTotal\"]]],null],false],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"amount-raised-meter\"],[\"dynamic-attr\",\"data-donation-goal\",[\"concat\",[[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"goal\"]]],null]]]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donation-pill-wrapper\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#_\"],[\"static-attr\",\"class\",\"boost-award\"],[\"flush-element\"],[\"text\",\"\\n          Boost \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          Award \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"donations\",\"boostTotal\"]]],null],false],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"fa fa-question-circle trigger\"],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"donationArray\"]]],null,2],[\"text\",\"        \\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"               \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"donation-pill donated odd\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"height: \",[\"unknown\",[\"donation\",\"percentage\"]],\"%;\"]]],[\"dynamic-attr\",\"data-donation\",[\"concat\",[[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"donation\",\"amount\"]]],null]]]],[\"dynamic-attr\",\"title\",[\"concat\",[[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"donation\",\"amount\"]]],null],\" Donation\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"               \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"donation-pill match\"],[\"static-attr\",\"data-donation-match\",\"100\"],[\"static-attr\",\"title\",\"$100 Donation Match\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"height: \",[\"unknown\",[\"donation\",\"percentage\"]],\"%;\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"donation\",\"isBoost\"]]],null,1,0]],\"locals\":[\"donation\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/donation-thermometer.hbs" } });
});
define("impact-public/templates/components/e-card", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "3Qqft+k0", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 cart-width share-box\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"email-header\"],[\"flush-element\"],[\"text\",\"Send an E-Card\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"alerts\"]]],null,9],[\"block\",[\"if\"],[[\"get\",[\"emailSent\"]]],null,7,6],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"margin-left\",\"20px;\"],[\"flush-element\"],[\"text\",\" - \"],[\"append\",[\"unknown\",[\"fromName\"]],false],[\"text\",\" \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        - \"],[\"append\",[\"unknown\",[\"email\",\"dedicationSelected\"]],false],[\"text\",\": \"],[\"append\",[\"unknown\",[\"email\",\"dedicationName\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"email\",\"nonprofit_name\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"email\",\"dedicate\"]]],null,1],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"email\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"I made donations to:\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"email-list\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"emailDonations\"]]],null,2],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                - \"],[\"append\",[\"unknown\",[\"donation\",\"dedicationSelected\"]],false],[\"text\",\": \"],[\"append\",[\"unknown\",[\"donation\",\"dedicationName\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\"],[\"checkbox\",[\"get\",[\"donation\",\"includeDonation\"]]]]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"dedicate\"]]],null,4],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendEmail\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Destination Email(s):\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\"],[\"text\",[\"get\",[\"email\"]],\"person@example.com\",\"form-control\"]]],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"p-small\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"help-block\"],[\"flush-element\"],[\"text\",\"You may enter multiple addresses separated by a comma\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Write your message here:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"placeholder\",\"rows\",\"wrap\",\"maxlength\"],[[\"get\",[\"message\"]],\"form-control\",\"Message\",\"5\",\"hard\",\"800\"]]],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"From Name:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\"],[\"text\",[\"get\",[\"fromName\"]],\"John Doe\",\"form-control\"]]],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Select the donations you would like listed in your e-card:\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"donations\"]]],null,5],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"p-small\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"help-block\"],[\"flush-element\"],[\"text\",\"Please note: donation amounts will not show up on e-card. If you want to notify\\n        the recipient(s) of the amount, please include it in the message\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"email-preview\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"email-subheader\"],[\"flush-element\"],[\"text\",\"Email Preview: \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/Impact_EmailHeader2.jpg\"],[\"static-attr\",\"class\",\"img-responsive\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"break-lines\"],[[\"get\",[\"message\"]]],null],true],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"emailDonations\"]]],null,3],[\"block\",[\"if\"],[[\"get\",[\"fromName\"]]],null,0],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary btn-lt-blue\"],[\"flush-element\"],[\"text\",\"Send\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancel\"]],[\"flush-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-success\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Your e-card was sent!\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendAnother\"]],[\"flush-element\"],[\"text\",\"Send Another\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancel\"]],[\"flush-element\"],[\"text\",\"Done\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"alert\"]],true],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"alert\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row no-print\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-warning\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Please check the following:\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"alerts\"]]],null,8],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/e-card.hbs" } });
});
define("impact-public/templates/components/floating-cart", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "15mgkLrq", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"hidden-sm hidden-xs\"],[\"static-attr\",\"id\",\"cart-panel\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-preview\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-headline\"],[\"flush-element\"],[\"text\",\"\\n            Cart\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"float-right\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-shopping-cart marg-r\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"floating-cart-list\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"donations\"]]],null,4],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"cart-subtotal\"],[\"flush-element\"],[\"text\",\"\\n            Subtotal\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"float-right\"],[\"flush-element\"],[\"text\",\"\\n                $\"],[\"append\",[\"helper\",[\"money-no-cents\"],[[\"get\",[\"cartTotal\"]]],null],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkout\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"checkout\"],[[\"class\"],[\"btn-primary btn-lt-blue\"]],2],[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"gray-link\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"checkout\"],null,1],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,0],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"receipt-resend\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Need your receipt?\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Enter your email address and we will send you a copy.\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"resendReceipts\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Email Address\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\"],[\"text\",[\"get\",[\"email\"]],\"Email\",\"form-control receipt marg-b\"]]],false],[\"text\",\"\\n                    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary small marg-t\"],[\"flush-element\"],[\"text\",\"Send\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    Edit Cart\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                Checkout\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"campaign-name\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"donation\",\"campaign_title\"]],false],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"floating-cart-item\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"charity-name\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setNameFilter\",[\"get\",[\"donation\",\"nonprofit_name\"]]]],[\"flush-element\"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"amount\"],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"helper\",[\"money-no-cents\"],[[\"get\",[\"donation\",\"amount\"]]],null],false],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"campaign_title\"]]],null,3],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/floating-cart.hbs" } });
});
define("impact-public/templates/components/growl-notification", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "gh/rAIfx", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"alert alert-growl \",[\"unknown\",[\"alertType\"]]]]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"unknown\",[\"notification\",\"content\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"notification\",\"isError\"]]],null,0],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"btn\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"alert\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/growl-notification.hbs" } });
});
define("impact-public/templates/components/growl-notifications-manager", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "2mpnr24b", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"growler-container\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"notifications\"]]],null,0],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"append\",[\"helper\",[\"growl-notification\"],null,[[\"action\",\"notification\"],[\"dismiss\",[\"get\",[\"notification\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"notification\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/growl-notifications-manager.hbs" } });
});
define("impact-public/templates/components/link-to-track", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "K2TJm4oE", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"link-to\"]]],null,2,0]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"unknown\",[\"link-text\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"block\",[\"link-to\"],[[\"get\",[\"link-to\"]]],null,1],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/link-to-track.hbs" } });
});
define("impact-public/templates/components/location-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "rA2onoBU", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-group\"],[\"static-attr\",\"id\",\"accordion-location\"],[\"static-attr\",\"role\",\"tablist\"],[\"static-attr\",\"aria-multiselectable\",\"true\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default panel-margin marg-b\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-heading\"],[\"static-attr\",\"role\",\"tab\"],[\"static-attr\",\"id\",\"location-heading\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-link\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-parent\",\"#accordion-location\"],[\"static-attr\",\"href\",\"#collapse-location\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"static-attr\",\"aria-controls\",\"collapse-location\"],[\"flush-element\"],[\"text\",\"\\n                    LOCATION\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"float-right pad-r\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-plus-sign\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"collapse-location\"],[\"static-attr\",\"class\",\"panel-collapse collapse\"],[\"static-attr\",\"role\",\"tabpanel\"],[\"static-attr\",\"aria-labelledby\",\"location-heading\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n\\n                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\"],[\"text\",[\"get\",[\"zip\"]],\"Zip code\",\"form-control\"]]],false],[\"text\",\"\\n\\n                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Radius\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\"],[[\"get\",[\"miles\"]]]],2],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"postCodeSearch\"]],[\"flush-element\"],[\"text\",\"Search\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"get\",[\"option\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"option\"]]]],0],[\"text\",\"\\n\"]],\"locals\":[\"option\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"milesOptions\"]]],null,1]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/location-filter.hbs" } });
});
define("impact-public/templates/components/main-nav", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "X9EGWRMc", "block": "{\"statements\":[[\"open-element\",\"nav\",[]],[\"static-attr\",\"class\",\"navbar navbar-default navbar-fixed-top\"],[\"static-attr\",\"role\",\"navigation\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"comment\",\" Brand and toggle get grouped for better mobile display \"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-header\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"navbar-toggle collapsed\"],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-target\",\"#bs-example-navbar-collapse-1\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"sr-only\"],[\"flush-element\"],[\"text\",\"Toggle navigation\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,31,30],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"comment\",\" Collect the nav links, forms, and other content for toggling \"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"collapse navbar-collapse\"],[\"static-attr\",\"id\",\"bs-example-navbar-collapse-1\"],[\"flush-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav navbar-nav navbar-right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,28],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,27,25],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,23,16],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,9],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"comment\",\" /.navbar-collapse \"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"comment\",\" /.container-fluid \"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"View Cart\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"checkout\"],null,0],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary\"],[\"flush-element\"],[\"text\",\"View Cart\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"checkout\"],null,2]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"dropdownlink\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"checkout\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"text\",\"\\n\"],[\"block\",[\"link-to-track\"],null,[[\"category\",\"action\",\"label\"],[\"cart\",\"checkout\",\"navigation\"]],3],[\"text\",\"                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"no-donations\"],[\"flush-element\"],[\"text\",\"No donations in cart.\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"dropdownlink\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"donate\"]],[\"flush-element\"],[\"text\",\"Add Donation\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"cart-item\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"item\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"cost\"],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"unknown\",[\"donation\",\"amount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]},{\"statements\":[[\"text\",\"                                    0\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    \"],[\"append\",[\"unknown\",[\"donations\",\"length\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown cart-nav ghd hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-shopping-cart\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"badge\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donations\"]]],null,8,7],[\"text\",\"                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown-subhead\"],[\"flush-element\"],[\"text\",\"Items in Cart:\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"donations\"]]],null,6,5],[\"block\",[\"if\"],[[\"get\",[\"donations\"]]],null,4],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"ghd visible-xs\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to-track\"],null,[[\"category\",\"action\",\"label\"],[\"cart\",\"checkout\",\"navigation\"]],1],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Sign In\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"account\"],null,10],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Logout\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Change Password\"]],\"locals\":[]},{\"statements\":[[\"text\",\"My Account\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"account\"],null,14],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"account.change-password\"],null,13],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"logout\"],null,12],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"Account\\n                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"user\"]]],null,15,11],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Sign In\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"account\"],null,17],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Logout\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Change Password\"]],\"locals\":[]},{\"statements\":[[\"text\",\"My Account\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"account\"],null,21],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"account.change-password\"],null,20],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"logout\"],null,19],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown ghd\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"Account\\n                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"user\"]]],null,22,18],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Contact Us\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"contact\"],null,24],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Contact\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"ghd\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"https://giving.impactgiveback.org/resources/2017GHDDonorFAQ.pdf\"],[\"static-attr\",\"target\",\"_blank\"],[\"flush-element\"],[\"text\",\"FAQ\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"ghd\"],[\"flush-element\"],[\"block\",[\"link-to\"],[\"contact\"],null,26],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"ghd\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"donate\"]],[\"flush-element\"],[\"text\",\"Donate\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"ghd\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"about\"]],[\"flush-element\"],[\"text\",\"About\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"ghd\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"sponsors\"]],[\"flush-element\"],[\"text\",\"Partners\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/GHD_logo2017.png\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"block\",[\"link-to\"],[\"thank-you\"],[[\"class\"],[\"navbar-brand\"]],29],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"navbar-brand ghd\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"home\"]],[\"flush-element\"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/GHD_logo2017.png\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/main-nav.hbs" } });
});
define("impact-public/templates/components/recurring-donation-row", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "KgGU5HXM", "block": "{\"statements\":[[\"open-element\",\"tr\",[]],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"dynamic-attr\",\"data-target\",[\"concat\",[\"#\",[\"unknown\",[\"recurringDonation\",\"id\"]]]]],[\"static-attr\",\"aria-expanded\",\"false\"],[\"dynamic-attr\",\"aria-controls\",[\"concat\",[[\"unknown\",[\"recurringDonation\",\"id\"]]]]],[\"static-attr\",\"class\",\"header-row collapsed\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"recurringDonation\",\"id\"]],false],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"recurringDonation\",\"charity\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n        $\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"recurringDonation\",\"quantity\"]]],null],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"processing_charges_paid\"]]],null,16],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"isYearly\"]]],null,14,13],[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"isCanceled\"]]],null,11],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"tr\",[]],[\"static-attr\",\"class\",\"collapse\"],[\"dynamic-attr\",\"id\",[\"concat\",[[\"unknown\",[\"recurringDonation\",\"id\"]]]]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"colspan\",\"2\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Status: \"],[\"close-element\"],[\"text\",\" \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"text-capitalize\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"recurringDonation\",\"statusLabel\"]],false],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Start Date: \"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"recurringDonation\",\"start\"]],\"MM/DD/YYYY\",\"X\"],null],false],[\"text\",\" \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"isCanceled\"]]],null,10,9],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"colspan\",\"2\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"editingAmount\"]]],null,8,4],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clearfix\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pull-right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"recurringDonation\",\"isCanceled\"]]],null,2],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\" \",[\"helper\",[\"if\"],[[\"get\",[\"disable\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showConfirmation\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Cancel Donation\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    Are you sure you want to cancel this recurring donation?\\n                    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"marg-l marg-r\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"disable\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancelRecurring\",[\"get\",[\"recurringDonation\"]]]],[\"flush-element\"],[\"text\",\"Yes\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"disable\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"hideConfirmation\"]],[\"flush-element\"],[\"text\",\"No\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"showConfirmation\"]]],null,1,0]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Processing Fee: \"],[\"close-element\"],[\"text\",\" $\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"recurringDonation\",\"processing_charges_amount\"]]],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Amount: \"],[\"close-element\"],[\"text\",\" $\"],[\"append\",[\"unknown\",[\"recurringDonation\",\"dollarAmount\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"processing_charges_paid\"]]],null,3],[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"marg-l\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editAmount\"]],[\"flush-element\"],[\"text\",\" Edit\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    $\"],[\"append\",[\"helper\",[\"cents-to-dollars\"],[[\"get\",[\"processingChargeAmount\"]]],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"amount\"]],\"form-control\",11]]],false],[\"text\",\"\\n                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"class\",\"maxlength\"],[\"text\",[\"get\",[\"recurringDonation\",\"dollarAmount\"]],\"form-control\",11]]],false],[\"text\",\"\\n\\n\\n                   \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"marg-r marg-l\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"saveAmount\"]],[\"flush-element\"],[\"text\",\" Save\"],[\"close-element\"],[\"text\",\" \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancelEditAmount\"]],[\"flush-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"type\",\"checkbox\"],[\"dynamic-attr\",\"checked\",[\"unknown\",[\"recurringDonation\",\"processing_charges_paid\"]],null],[\"dynamic-attr\",\"onclick\",[\"helper\",[\"action\"],[[\"get\",[null]],\"setPayingCharges\"],[[\"value\"],[\"target.checked\"]]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\" Include processing fees\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    Saving...\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"savingAmount\"]]],null,7,6],[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"processing_charges_paid\"]]],null,5]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Next Gift Date: \"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"recurringDonation\",\"nextGiftDate\"]],\"MM/DD/YYYY\",\"X\"],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Canceled Date: \"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"recurringDonation\",\"ended_at\"]],\"MM/DD/YYYY\",\"X\"],null],false],[\"text\",\" \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"label label-danger\"],[\"flush-element\"],[\"text\",\"Canceled on \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"recurringDonation\",\"ended_at\"]],\"MM/DD/YYYY\",\"X\"],null],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            Every \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"recurringDonation\",\"start\"]],\"Do\",\"X\"],null],false],[\"text\",\" of the month\\n        \"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"recurringDonation\",\"isMonthly\"]]],null,12]],\"locals\":[]},{\"statements\":[[\"text\",\"            Yearly on \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"recurringDonation\",\"start\"]],\"MMMM Do\",\"X\"],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-info-sign\"],[\"static-attr\",\"data-toggle\",\"tooltip\"],[\"static-attr\",\"data-placement\",\"top\"],[\"static-attr\",\"title\",\"Covering Processing Fees\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"bootstrap-tooltip\"],null,null,15]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/recurring-donation-row.hbs" } });
});
define("impact-public/templates/components/refund-impact", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "tCIv0Pnv", "block": "{\"statements\":[[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"red\"],[\"flush-element\"],[\"text\",\"Impact Refund Policy\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"refund-policy\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"As a Donor, you are responsible for ensuring that you have selected\\n    the correct organization to donate to and the correct intended amount to donate.\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"If there are any extenuating circumstances, please contact the\\n    administrator at info@impactfdn.org or call 701-271-0263 immediately and your case will be\\n    reviewed individually.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/refund-impact.hbs" } });
});
define("impact-public/templates/components/refund-lah", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "V1l9vRf4", "block": "{\"statements\":[[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"red\"],[\"flush-element\"],[\"text\",\"LEND A HAND UP REFUND POLICY\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"refund-policy\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"As a Donor, you are responsible for ensuring that you have selected the correct benefit/campaign to donate to and the correct intended amount to donate.\"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"If there are any extenuating circumstances, please contact the administrator at jeanapeinovich@dakmed.org or call 701-271-0263 immediately and your case will be reviewed individually.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/refund-lah.hbs" } });
});
define("impact-public/templates/components/scroll-load", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Fb2xYUnn", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isLoading\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/scroll-load.hbs" } });
});
define("impact-public/templates/components/state-select", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "rDdJNKKq", "block": "{\"statements\":[[\"comment\",\" The second value will be selected initially \"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"name\",\"disabled\",\"class\",\"value\",\"action\"],[\"state-select\",[\"get\",[\"disabled\"]],\"form-control\",[\"get\",[\"selectedState\"]],\"selectState\"]],4]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"unknown\",[\"state\",\"label\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"state\",\"value\"]]]],0],[\"text\",\"\\n\"]],\"locals\":[\"state\"]},{\"statements\":[[\"append\",[\"unknown\",[\"state\",\"label\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"state\",\"value\"]]]],2],[\"text\",\"\\n\"]],\"locals\":[\"state\"]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"option\",[]],[\"flush-element\"],[\"text\",\"State/Province\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"optgroup\",[]],[\"static-attr\",\"label\",\"United States\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"usStatesList\"]]],null,3],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"optgroup\",[]],[\"static-attr\",\"label\",\"Canada\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"caProvinceList\"]]],null,1],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/state-select.hbs" } });
});
define("impact-public/templates/components/track-checkbox", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "NEPe5YyB", "block": "{\"statements\":[[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"checked\"],[\"checkbox\",[\"get\",[\"selected\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/track-checkbox.hbs" } });
});
define("impact-public/templates/components/type-filter", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "I6rTqd4u", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-group\"],[\"static-attr\",\"id\",\"accordion-type\"],[\"static-attr\",\"role\",\"tablist\"],[\"static-attr\",\"aria-multiselectable\",\"true\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default panel-margin\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-heading\"],[\"static-attr\",\"role\",\"tab\"],[\"static-attr\",\"id\",\"type-heading\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-link\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-parent\",\"#accordion-type\"],[\"static-attr\",\"href\",\"#collapse-type\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"static-attr\",\"aria-controls\",\"collapse-type\"],[\"flush-element\"],[\"text\",\"\\n                    TYPE FILTER\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"float-right pad-r\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-minus-sign\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"collapse-type\"],[\"static-attr\",\"class\",\"panel-collapse collapse active in\"],[\"static-attr\",\"role\",\"tabpanel\"],[\"static-attr\",\"aria-labelledby\",\"type-heading\"],[\"static-attr\",\"aria-expanded\",\"true\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sortedTypes\"]]],null,0],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-4 col-md-4 col-sm-2 col-xs-4\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"type-height\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"aj-type-label\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"text\",\"                                    \"],[\"append\",[\"helper\",[\"track-checkbox\"],null,[[\"category\",\"action\",\"label\",\"selected\"],[\"filter\",\"type\",[\"get\",[\"type\",\"name\"]],[\"get\",[\"type\",\"isSelected\"]]]]],false],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"icons-typesearch \",[\"helper\",[\"if\"],[[\"get\",[\"type\",\"isSelected\"]],\"active\"],null],\" \"]]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"unknown\",[\"type\",\"iconClass\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-types\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"type\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"type\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/type-filter.hbs" } });
});
define("impact-public/templates/components/validated-formgroup", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "scUmuL6G", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"form-group \",[\"unknown\",[\"errorState\"]]]]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"yield\",\"default\",[[\"get\",[null]]]],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/validated-formgroup.hbs" } });
});
define("impact-public/templates/components/video-frame", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "HwZ5AA1s", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"embed-responsive embed-responsive-16by9\"],[\"static-attr\",\"style\",\"padding-bottom:56.25%;\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"iframe\",[]],[\"static-attr\",\"class\",\"embed-responsive-item\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"source\"]],null],[\"dynamic-attr\",\"width\",[\"unknown\",[\"width\"]],null],[\"dynamic-attr\",\"height\",[\"unknown\",[\"height\"]],null],[\"static-attr\",\"frameborder\",\"0\"],[\"static-attr\",\"webkitallowfullscreen\",\"\"],[\"static-attr\",\"mozallowfullscreen\",\"\"],[\"static-attr\",\"allowfullscreen\",\"\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/video-frame.hbs" } });
});
define("impact-public/templates/components/view-receipt", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QbTBW7yW", "block": "{\"statements\":[[\"open-element\",\"h3\",[]],[\"static-attr\",\"class\",\"no-print lt-blue\"],[\"flush-element\"],[\"text\",\"Receipt:\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"background: white; margin-top: 30px;margin-left: -15px; height: 90px; padding-left: 30px;padding-top: 20px; padding-bottom: 20px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,27,26],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,25,23],[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"style\",\"background-color: white; margin-right: 0px;\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"address\",[]],[\"static-attr\",\"style\",\"color: #414141; padding-left: 20px; margin-top: 30px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donor\"]]],null,21,19],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"donations\"]]],null,17],[\"block\",[\"if\"],[[\"get\",[\"processingChargesLabel\"]]],null,8],[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"margin-left: -15px; background-color: #dbdbdb; padding: 10px 30px 10px 30px; font-size: 12px; line-height: 16px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,3,2],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,1,0],[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"style\",\"padding-top: 10px; padding-bottom: 10px;\"],[\"flush-element\"],[\"text\",\"No goods or services were provided in connection with this generous donation. Please retain a copy of this for your records.\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n                    DONATIONS TO NONPROFIT ORGANIZATIONS AND CHARITABLE FUNDS OF DMF/IMPACT INSTITUTE\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    Donations made to qualified nonprofit organizations and charitable funds of DMF and Impact Institute are generally considered to be tax-deductible according to IRS guidelines.\\n                \"],[\"close-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n                GIFTS TO INDIVIDUAL/FAMILY BENEFIT FUNDS\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                Lend A Hand, a program of DMF, helps raise funds for individuals and families in medical crisis.  Gifts made to individual/family benefit funds through the Lend A Hand program are generally NOT considered to be tax-deductible according to IRS guidelines.   If you made a gift to an individual/family benefit fund, please consult your tax advisor.\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"em\",[]],[\"flush-element\"],[\"text\",\"Please note that this gift will show up on your credit card statement as a charge to Impact Institute.\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-b\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-print float-right\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-b\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red\"],[\"static-attr\",\"style\",\"display: inline-block; margin-right: 10px;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"printReceipt\"]],[\"flush-element\"],[\"text\",\"Print \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-print\"],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"static-attr\",\"style\",\"display: inline-block\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleViewReceipt\"]],[\"flush-element\"],[\"text\",\"Close\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"style\",\"color: #346ea2; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-right: 20px; float: right; margin-top: 30px;\"],[\"flush-element\"],[\"text\",\"\\n                        $\"],[\"append\",[\"unknown\",[\"chargeAmountLabel\"]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"style\",\"color: #ae161f; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-right: 20px; float: right; margin-top: 30px;\"],[\"flush-element\"],[\"text\",\"\\n                        $\"],[\"append\",[\"unknown\",[\"chargeAmountLabel\"]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"style\",\"color: #346ea2; font-size: 16px; font-weight: bold; text-transform: uppercase; float: left; margin-top: 30px;\"],[\"flush-element\"],[\"text\",\"\\n                        Total Donations\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"h3\",[]],[\"static-attr\",\"style\",\"color: #ae161f; font-size: 16px; font-weight: bold; text-transform: uppercase; float: left; margin-top: 30px;\"],[\"flush-element\"],[\"text\",\"\\n                        Total Donations\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"style\",\"font-weight: bold; color: #73afe1\"],[\"flush-element\"],[\"text\",\"\\n                                    $\"],[\"append\",[\"unknown\",[\"processingChargesLabel\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"style\",\"font-weight: bold; color: black\"],[\"flush-element\"],[\"text\",\"\\n                                    $\"],[\"append\",[\"unknown\",[\"processingChargesLabel\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"display: inline-block; margin-top:10px; color: #73afe1; font-size: 16px; font-weight: bold; height: 67px; vertical-align: top;\"],[\"flush-element\"],[\"text\",\"\\n                                    Processing Charges\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"display: inline-block; margin-top:10px; font-size: 16px; font-weight: bold; height: 67px; vertical-align: top;\"],[\"flush-element\"],[\"text\",\"\\n                                    Processing Charges\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"style\",\"background-color: white; padding: 10px 0px 40px 10px; border-bottom: dotted 1px #dbdbdb;margin-right: 0px;\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"display: inline-block; margin-left: 10px; vertical-align: top\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,7,6],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6\"],[\"static-attr\",\"style\",\"text-align: right;\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"display: inline-block; height: 67px; padding: 3px 30px 6px 10px; vertical-align: top;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,5,4],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"style\",\"font-weight: bold; color: #73afe1\"],[\"flush-element\"],[\"text\",\"\\n                                    $\"],[\"append\",[\"unknown\",[\"donation\",\"amountLabel\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"style\",\"font-weight: bold; color: black\"],[\"flush-element\"],[\"text\",\"\\n                                    $\"],[\"append\",[\"unknown\",[\"donation\",\"amountLabel\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"style\",\"font-size: 14px; margin-top: -10px; font-weight: bold;\"],[\"flush-element\"],[\"text\",\"Refunded\\n                                    on: \"],[\"append\",[\"helper\",[\"pretty-date\"],[[\"get\",[\"donation\",\"refund_created\"]]],null],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                Donation #\"],[\"append\",[\"unknown\",[\"donation\",\"id\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        -- \"],[\"append\",[\"unknown\",[\"donation\",\"campaign_name\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h2\",[]],[\"static-attr\",\"style\",\"color: #73afe1; font-size: 16px; font-weight: bold; vetical-align: top\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"campaign_name\"]]],null,13],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    -- \"],[\"append\",[\"unknown\",[\"donation\",\"campaign_name\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h2\",[]],[\"static-attr\",\"style\",\"color: black; font-size: 16px; font-weight: bold; vetical-align: top\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"unknown\",[\"donation\",\"nonprofit_name\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"campaign_name\"]]],null,15]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"style\",\"background-color: white; padding: 0px 0px 40px 10px; border-bottom: dotted 1px #dbdbdb;margin-right: 0px;\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"display: inline-block; margin-left: 10px; margin-top: -10px; vertical-align: top\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,16,14],[\"block\",[\"if\"],[[\"get\",[\"donation\",\"id\"]]],null,12],[\"block\",[\"if\"],[[\"get\",[\"refunded\"]]],null,11],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6\"],[\"static-attr\",\"style\",\"text-align: right;\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"display: inline-block; height: 67px; padding: 3px 30px 6px 10px; vertical-align: top;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"manageGhd\",\"isGHD\"]]],null,10,9],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"donation\"]},{\"statements\":[[\"text\",\"                                Business: \"],[\"append\",[\"unknown\",[\"transaction\",\"business\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"transaction\",\"user_name\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"transaction\",\"user_last_name\"]],false],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"unknown\",[\"transaction\",\"billing_street\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"unknown\",[\"transaction\",\"billing_city\"]],false],[\"text\",\"\\n                            , \"],[\"append\",[\"unknown\",[\"transaction\",\"billing_state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"transaction\",\"billing_postal_code\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"transaction\",\"business\"]]],null,18]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"append\",[\"unknown\",[\"donor\",\"billing_address2\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"donor\",\"first_name\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"donor\",\"last_name\"]],false],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"unknown\",[\"donor\",\"billing_address\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"donor\",\"billing_address2\"]]],null,20],[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"donor\",\"billing_city\"]],false],[\"text\",\"\\n                            , \"],[\"append\",[\"unknown\",[\"donor\",\"billing_state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"donor\",\"billing_postal_code\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        Transaction #\"],[\"append\",[\"unknown\",[\"transaction\",\"id\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"background-color: #346ea2; height: 115px; margin-left: -15px; padding-top: 5px;padding-left: 30px; padding-right: 30px;\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h2\",[]],[\"static-attr\",\"style\",\"color: white; font-size: 24px; font-weight: normal\"],[\"flush-element\"],[\"text\",\"Thank you for your donation.\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"color: white; font-size: 14px; font-weight: normal; float: left;\"],[\"flush-element\"],[\"text\",\"\\n                    Here is a receipt for your recent donations.\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"color: white; font-size: 14px; margin-right: 20px; float: right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"transaction\",\"id\"]]],null,22],[\"text\",\"                    \"],[\"append\",[\"helper\",[\"pretty-date\"],[[\"get\",[\"transaction\",\"date\"]]],null],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        Transaction #\"],[\"append\",[\"unknown\",[\"transaction\",\"id\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"background-color: #ae161f; height: 115px; margin-left: -15px; padding-top: 5px;padding-left: 30px; padding-right: 30px;\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h2\",[]],[\"static-attr\",\"style\",\"color: white; font-size: 24px; font-weight: normal\"],[\"flush-element\"],[\"text\",\"Thank you for your donation.\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"color: white; font-size: 14px; font-weight: normal; float: left;\"],[\"flush-element\"],[\"text\",\"\\n                    Here is a receipt for your recent donations.\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"color: white; font-size: 14px; margin-right: 20px; float: right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"transaction\",\"id\"]]],null,24],[\"text\",\"                    \"],[\"append\",[\"helper\",[\"pretty-date\"],[[\"get\",[\"transaction\",\"date\"]]],null],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"https://impactgiveback.org/wp-content/themes/impact/img/logo.png\"],[\"static-attr\",\"style\",\"max-height: 50px;\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"../images/email-GHD-logo.jpg\"],[\"static-attr\",\"style\",\"max-height: 50px;\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/view-receipt.hbs" } });
});
define("impact-public/templates/components/volunteer-box", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "zsuUzs8z", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default hide\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"opportunity-title\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-8 name\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"opportunity\",\"title\"]],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"opportunity\",\"types\"]]],null,13],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 hidden-md hidden-sm hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive logo\"],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"opportunity\",\"organization\",\"https_logo\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"view-all-link\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"volunteer\",[\"helper\",[\"query-params\"],null,[[\"charity\"],[[\"get\",[\"opportunity\",\"organization\",\"id\"]]]]]],null,12],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,11],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-6 col-md-8 col-sm-12 volunteer-section\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"opportunity\",\"organization\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 locations-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-map-marker\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"append\",[\"unknown\",[\"opportunity\",\"city\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"opportunity\",\"state\"]],false],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-calendar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"opportunity\",\"ongoing\"]]],null,9,8],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,7,4],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-3 col-md-4 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-buttons\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"opportunity\",\"organization\",\"volunteer_access\"]]],null,3],[\"text\",\"                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-secondary btn-red medium\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleLearnMore\"]],[\"flush-element\"],[\"text\",\"\\n                    Learn More\\n\"],[\"block\",[\"if\"],[[\"get\",[\"learnMore\"]]],null,1,0],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-plus\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-minus\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        Volunteer\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"link-to\"],[\"volunteer.opportunity\",[\"get\",[\"opportunity\",\"id\"]]],[[\"class\"],[\"btn-primary btn-red medium\"]],2],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-content\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"description\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"opportunity\",\"short_description\"]],false],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            Volunteer\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"skill\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"skill\"]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-content\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"description\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"opportunity\",\"short_description\"]],false],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"description\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"opportunity\",\"description\"]],false],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"skills\"],[\"flush-element\"],[\"text\",\"Skills:\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"list-unstyled\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"opportunity\",\"skills\"]]],null,6],[\"text\",\"                            \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Requirements\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"unknown\",[\"opportunity\",\"requirements\"]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 hidden-sm hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"volunteer.opportunity\",[\"get\",[\"opportunity\",\"id\"]]],[[\"class\"],[\"btn-primary btn-red medium pull-left\"]],5],[\"text\",\"                        \"],[\"comment\",\"<button {{action 'toggleLearnMore'}} class=\\\"btn-secondary btn-red medium\\\">Hide Details</button>&ndash;&gt;\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        Ongoing\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"append\",[\"unknown\",[\"opportunity\",\"event_date\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-time\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"opportunity\",\"start_time\"]],\"hh:mm a\",\"HH:mm:ss\"],null],false],[\"text\",\" -\\n                        \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"opportunity\",\"end_time\"]],\"hh:mm a\",\"HH:mm:ss\"],null],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Time Commitment\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"opportunity\",\"time_commitment\"]],false],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-content\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"contact-info\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Address\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"opportunity\",\"address\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"opportunity\",\"city\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"opportunity\",\"state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"opportunity\",\"zip\"]],false],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"opportunity\",\"time_commitment\"]]],null,10],[\"text\",\"                    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Point of Contact\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"opportunity\",\"contact_name\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"opportunity\",\"contact_phone\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"href\",[\"concat\",[\"mailto:\",[\"unknown\",[\"opportunity\",\"contact_email\"]]]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"unknown\",[\"opportunity\",\"contact_email\"]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    View all \"],[\"append\",[\"unknown\",[\"opportunity\",\"organization\",\"name\"]],false],[\"text\",\" opportunities\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"icons-category\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"charity-symbol\"],null,[[\"typeId\",\"title\",\"showTooltip\"],[[\"get\",[\"type\",\"id\"]],[\"get\",[\"type\",\"name\"]],true]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"type\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/volunteer-box.hbs" } });
});
define("impact-public/templates/components/volunteer-sidebar-search", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "MUMlcFhb", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nonprofit\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-l\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"id\"],[\"text\",[\"get\",[\"nameFilterText\"]],\"Search Opportunities\",\"form-control search\",\"name-search-input\"]]],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hasFilters\"]]],null,0],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"pull-right\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearSearchFilters\"]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    Clear Filters\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/volunteer-sidebar-search.hbs" } });
});
define("impact-public/templates/components/volunteer-sidebar-skills", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "le0jykKu", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default marg-t\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-heading\"],[\"static-attr\",\"role\",\"tab\"],[\"static-attr\",\"id\",\"skill-heading\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-link\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-parent\",\"accordion-type\"],[\"static-attr\",\"href\",\"#collapse-skills\"],[\"static-attr\",\"aria-expanded\",\"true\"],[\"static-attr\",\"aria-controls\",\"collapse-skills\"],[\"flush-element\"],[\"text\",\"\\n                CATEGORY FILTER\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"float-right pad-r\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-plus-sign\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"collapse-skills\"],[\"static-attr\",\"class\",\"panel-collapse collapse\"],[\"static-attr\",\"role\",\"tabpanel\"],[\"static-attr\",\"aria-labelledby\",\"skills-heading\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"skills\"]]],null,0],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 skill-list\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"helper\",[\"checkbox-option\"],null,[[\"handler\",\"checkbox_value\",\"text\",\"checked\"],[\"skills_handler\",[\"get\",[\"skill\",\"skill\"]],[\"get\",[\"skill\",\"skill\"]],[\"get\",[\"skill\",\"checked\"]]]]],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"skill\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/volunteer-sidebar-skills.hbs" } });
});
define("impact-public/templates/components/volunteer-sidebar-time-commitment", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "x0W/werc", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n    Time Commitment\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"time_commitments\"]]],null,0],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"append\",[\"helper\",[\"checkbox-option\"],null,[[\"handler\",\"checkbox_value\",\"text\"],[\"time_commitments_handler\",[\"get\",[\"commitment\",\"commitment_type\"]],[\"get\",[\"commitment\",\"commitment_type\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"commitment\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/volunteer-sidebar-time-commitment.hbs" } });
});
define("impact-public/templates/components/volunteer-sidebar-type", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "OKgg8xrn", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-group\"],[\"static-attr\",\"id\",\"accordion-type\"],[\"static-attr\",\"role\",\"tablist\"],[\"static-attr\",\"aria-multiselectable\",\"true\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default panel-margin\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-heading\"],[\"static-attr\",\"role\",\"tab\"],[\"static-attr\",\"id\",\"type-heading\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-link\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-parent\",\"#accordion-type\"],[\"static-attr\",\"href\",\"#collapse-type\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"static-attr\",\"aria-controls\",\"collapse-type\"],[\"flush-element\"],[\"text\",\"\\n                    TYPE FILTER\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"float-right pad-r\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-plus-sign\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"collapse-type\"],[\"static-attr\",\"class\",\"panel-collapse collapse active\"],[\"static-attr\",\"role\",\"tabpanel\"],[\"static-attr\",\"aria-labelledby\",\"type-heading\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sortedTypes\"]]],null,0],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-4 col-md-4 col-sm-2 col-xs-4\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"type-height\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"checkbox\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"aj-type-label\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"helper\",[\"checkbox-option\"],null,[[\"handler\",\"checkbox_value\"],[\"type_handler\",[\"get\",[\"type\",\"name\"]]]]],false],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"icons-typesearch \",[\"helper\",[\"if\"],[[\"get\",[\"type\",\"isSelected\"]],\"active\"],null]]]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"unknown\",[\"type\",\"iconClass\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-types\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"type\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"type\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/volunteer-sidebar-type.hbs" } });
});
define("impact-public/templates/components/volunteer-sidebar", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1QRhFyvp", "block": "{\"statements\":[],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/volunteer-sidebar.hbs" } });
});
define("impact-public/templates/components/x-select", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Kmq7j2Ue", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/components/x-select.hbs" } });
});
define("impact-public/templates/contact", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "dmHhaQ17", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"ghd\",\"isGHD\"]]],null,1,0],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"style\",\"margin-top: 20px;\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-md-offset-4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"We are busy answering your questions as quickly as possible.\\n            Please take a look at our \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"https://giving.impactgiveback.org/resources/2017GHDDonorFAQ.pdf\"],[\"flush-element\"],[\"text\",\"Donor FAQ to see if your question can be answered there\"],[\"close-element\"],[\"text\",\".\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"https://giving.impactgiveback.org/resources/2017GHDDonorFAQ.pdf\"],[\"flush-element\"],[\"text\",\"Donor FAQ\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"If you are unable to find the answer to your question on the FAQ\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"https://app.smartsheet.com/b/form?EQBCT=781f93269afa4e75ae476777edc9643f\"],[\"flush-element\"],[\"text\",\"please fill out the contact us form\"],[\"close-element\"],[\"text\",\" or call us at \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"tel:+701-271-0263\"],[\"flush-element\"],[\"text\",\"(701)-271-0263\"],[\"close-element\"],[\"text\",\".\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"https://app.smartsheet.com/b/form?EQBCT=781f93269afa4e75ae476777edc9643f\"],[\"flush-element\"],[\"text\",\"Contact us!\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Thank you for being a part of Giving Hearts Day!\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-header-cart\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"CONTACT US\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header ghd\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Contact Us\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/contact.hbs" } });
});
define("impact-public/templates/countdown", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "KblRCJUI", "block": "{\"statements\":[[\"open-element\",\"nav\",[]],[\"static-attr\",\"class\",\"navbar navbar-default\"],[\"static-attr\",\"id\",\"myDropdown\"],[\"static-attr\",\"role\",\"navigation\"],[\"flush-element\"],[\"text\",\"\\n     \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n         \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-header\"],[\"flush-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-brand\"],[\"flush-element\"],[\"text\",\"\\n                 \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/GHD_logo2017.png\"],[\"static-attr\",\"alt\",\"Giving Hearts Logo\"],[\"static-attr\",\"title\",\"Giving Hearts Logo\"],[\"static-attr\",\"class\",\"countdown-logo\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n             \"],[\"close-element\"],[\"text\",\"\\n         \"],[\"close-element\"],[\"text\",\"\\n     \"],[\"close-element\"],[\"text\",\"\\n \"],[\"close-element\"],[\"text\",\"\\n\\n \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n     \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n         \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"herophoto-countdown\"],[\"flush-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                 \"],[\"append\",[\"helper\",[\"count-down\"],null,[[\"action\"],[\"transitionToHome\"]]],false],[\"text\",\"\\n             \"],[\"close-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"tickerwords\"],[\"flush-element\"],[\"text\",\"until Giving Hearts Day 2017\"],[\"close-element\"],[\"text\",\"\\n         \"],[\"close-element\"],[\"text\",\"\\n     \"],[\"close-element\"],[\"text\",\"\\n \"],[\"close-element\"],[\"text\",\"\\n\\n\\n \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n   \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n     \"],[\"append\",[\"helper\",[\"charity-list\"],null,[[\"forceGHD\"],[true]]],false],[\"text\",\"\\n   \"],[\"close-element\"],[\"text\",\"\\n \"],[\"close-element\"],[\"text\",\"\\n\\n \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"countdown-footer\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/countdown.hbs" } });
});
define("impact-public/templates/home-lah", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "KqWd9vs9", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-background ghd\"],[\"static-attr\",\"id\",\"charity-area\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"block\",[\"if\"],[[\"get\",[\"showCartTotal\"]]],null,5],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"name\",\"searchedNonprofit\"],[\"static-attr\",\"id\",\"searchedNonprofit\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9 nonprofit\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-7\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-l\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"id\",\"key-up\"],[\"text\",[\"get\",[\"nameFilterText\"]],\"Search by Name or Keyword\",\"form-control search\",\"name-search-input\",[\"helper\",[\"action\"],[[\"get\",[null]],\"filterResults\"],null]]]],false],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"nameFilterText\"]]],null,4],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"or\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"postCodeSearch\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text input-group\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"focus-in\"],[\"text\",[\"get\",[\"zip\"]],\"Zip code\",\"form-control zip-code\",\"resetZip\"]]],false],[\"text\",\"\\n                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"within\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"block\",[\"x-select\"],null,[[\"value\",\"class\"],[[\"get\",[\"miles\"]],\"radius\"]],3],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary btn-zip-code\"],[\"flush-element\"],[\"text\",\"Go\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"hasFilters\"]],\" \",\"hidden \"],null]]]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-results\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"noResults\"]],\" \",\"hidden \"],null]]]],[\"flush-element\"],[\"text\",\"Your search did not match any results.\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear-all-link\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearFilters\"]],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Clear Search Filters\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"block\",[\"each\"],[[\"get\",[\"sortedCharities\"]]],null,0],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\" \"],[\"append\",[\"helper\",[\"charity-box-lah\"],null,[[\"charity\",\"application\"],[[\"get\",[\"charity\"]],[\"get\",[\"application\"]]]]],false],[\"text\",\" \"]],\"locals\":[\"charity\"]},{\"statements\":[[\"append\",[\"unknown\",[\"option\",\"label\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"option\",\"value\"]]]],1],[\"text\",\"\\n                \"]],\"locals\":[\"option\"]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"each\"],[[\"get\",[\"milesOptions\"]]],null,2],[\"text\",\" \"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle pull-right pad-r\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"resetNameFilter\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"append\",[\"helper\",[\"floating-cart\"],null,[[\"donations\",\"action\",\"resendReceipts\"],[[\"get\",[\"application\",\"donations\"]],\"setNameFilter\",[\"helper\",[\"action\"],[[\"get\",[null]],\"resendReceipts\"],null]]]],false],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/home-lah.hbs" } });
});
define("impact-public/templates/home", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "6DG9on6F", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,22],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,21],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-background ghd\"],[\"static-attr\",\"id\",\"charity-area\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"aj-filter-boxes\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"isGHD\"]],\"ghd\"],null]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isImpactApp\"]]],null,18],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showCartTotal\"]]],null,17,16],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"name\",\"searchedNonprofit\"],[\"static-attr\",\"id\",\"searchedNonprofit\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9 nonprofit\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-7\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-l\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"id\"],[\"text\",[\"get\",[\"nameFilterText\"]],\"Search by Name or Keyword\",\"form-control search\",\"name-search-input\"]]],false],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"nameFilterText\"]]],null,14],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,13],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"or\"],[\"close-element\"],[\"text\",\"\\n\\n                        \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"postCodeSearch\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text input-group\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"focus-in\"],[\"text\",[\"get\",[\"zip\"]],\"Zip code\",\"form-control zip-code\",\"resetZip\"]]],false],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"within\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"class\"],[[\"get\",[\"miles\"]],\"radius\"]],12],[\"text\",\"                                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary btn-zip-code\"],[\"flush-element\"],[\"text\",\"Go\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,9],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"searching\"]]],null,7,6],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"aj-footer\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"name\",\"sponsors\"],[\"static-attr\",\"id\",\"sponsors\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-header ghd\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Partners\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"partner-bg\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 sponsor-headline\"],[\"flush-element\"],[\"text\",\"Co-Hosts\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row marg-t\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/impact-logo.jpg\"],[\"static-attr\",\"class\",\"img-responsive co-hosts\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/DMFLOGO.jpg\"],[\"static-attr\",\"class\",\"img-responsive co-hosts\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-4 pad-t\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/AlexSternlogo.jpg\"],[\"static-attr\",\"class\",\"img-responsive co-hosts\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 sponsor-headline\"],[\"flush-element\"],[\"text\",\"Sponsors\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row marg-t\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/bush_logo.jpg\"],[\"static-attr\",\"class\",\"img-responsive sponsors\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/gatecitylogo.jpg\"],[\"static-attr\",\"class\",\"img-responsive sponsors\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/scheelslogo.jpg\"],[\"static-attr\",\"class\",\"img-responsive sponsors\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-sm-3\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/visionbank.jpg\"],[\"static-attr\",\"class\",\"img-responsive sponsors visionbank\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-sm-6\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"thumbnail\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setNameFilter\",[\"get\",[\"sample\",\"name\"]]]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"img-responsive sample-photo\"],[\"dynamic-attr\",\"src\",[\"unknown\",[\"sample\",\"https_image\"]],null],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sample-organizations\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"sample\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"sample\"]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Loading more...\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"scroll-load\"],null,[[\"isLoading\",\"action\",\"noMore\"],[[\"get\",[\"loadingMore\"]],\"getMore\",[\"get\",[\"noMore\"]]]],2]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"helper\",[\"charity-box\"],null,[[\"charity\",\"application\"],[[\"get\",[\"charity\"]],[\"get\",[\"application\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"charity\"]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear-all-link\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearSearchFilters\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Clear Search\\n                                    Filters\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"hasFilters\"]],\"\",\"hidden\"],null]]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-results\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"noResults\"]],\"\",\"hidden\"],null]]]],[\"flush-element\"],[\"text\",\"Your search did not match any results.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,5],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"each\"],[[\"get\",[\"allOrganizationsSorted\"]]],null,4],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"allFilter\"]]],null,3],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"hasFilters\"]],\"hidden\",\"\"],null]]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-text\"],[\"flush-element\"],[\"text\",\"Search by using the filters or consider one of these featured\\n                            charities.\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sampleOrganizations\"]]],null,1],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-spinner sk-spinner-fading-circle\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle1 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle2 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle3 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle4 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle5 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle6 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle7 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle8 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle9 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle10 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle11 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle12 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-list-alt\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" View \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITY\"]],false],[\"text\",\" Listing\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"view-all-list\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"charity-list\"],null,8],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"view-all-link visible-sm visible-xs\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"viewAll\"]],[\"flush-element\"],[\"text\",\"View All \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITIES\"]],false],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-angle-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"unknown\",[\"option\",\"label\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"option\",\"value\"]]]],10],[\"text\",\"\\n\"]],\"locals\":[\"option\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"milesOptions\"]]],null,11]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"view-all-link hidden-sm hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"a\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"viewAll\"]],[\"flush-element\"],[\"text\",\"View All \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITIES\"]],false],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-angle-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle pull-right pad-r\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearSearchFilters\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"receipt-resend\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Need your receipt?\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Enter your email address and we will send you a copy.\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"resendReceipts\",[\"get\",[\"email\"]]],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Email Address\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\"],[\"text\",[\"get\",[\"email\"]],\"Email\",\"form-control receipt marg-b\"]]],false],[\"text\",\"\\n                                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary small marg-t\"],[\"flush-element\"],[\"text\",\"Send\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isImpactApp\"]]],null,15]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"append\",[\"helper\",[\"floating-cart\"],null,[[\"donations\",\"action\",\"resendReceipts\"],[[\"get\",[\"application\",\"donations\"]],\"setNameFilter\",[\"helper\",[\"action\"],[[\"get\",[null]],\"resendReceipts\"],null]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                      \"],[\"append\",[\"helper\",[\"type-filter\"],null,[[\"types\"],[[\"get\",[\"types\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"\\n                    Find A \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITY\"]],false],[\"text\",\" To Love\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-header ghd donation-header\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Find A \"],[\"append\",[\"unknown\",[\"LABELS\",\"CHARITY\"]],false],[\"text\",\" To Love\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"name\",\"donate\"],[\"static-attr\",\"id\",\"donate\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isGHD\"]]],null,20,19]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"home\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"herophoto\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"tickermoneysign\"],[\"flush-element\"],[\"open-element\",\"sup\",[]],[\"flush-element\"],[\"text\",\"$\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ticker\"],[\"flush-element\"],[\"append\",[\"helper\",[\"money-rounded\"],[[\"get\",[\"donationsSoFar\"]]],null],false],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"tickerwords\"],[\"flush-element\"],[\"text\",\"Raised so far from \"],[\"append\",[\"unknown\",[\"totalDonors\"]],false],[\"text\",\" donors\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"donate\"]],[\"flush-element\"],[\"text\",\"Donate Now\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"text\",\"    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"name\",\"about\"],[\"static-attr\",\"id\",\"about\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-header ghd\"],[\"flush-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"about\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"embed-responsive embed-responsive-16by9\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"iframe\",[]],[\"static-attr\",\"class\",\"embed-responsive-item\"],[\"static-attr\",\"src\",\"https://www.youtube.com/embed/6njctiJLLMk\"],[\"static-attr\",\"width\",\"500\"],[\"static-attr\",\"height\",\"281\"],[\"static-attr\",\"frameborder\",\"0\"],[\"static-attr\",\"webkitallowfullscreen\",\"\"],[\"static-attr\",\"mozallowfullscreen\",\"\"],[\"static-attr\",\"allowfullscreen\",\"\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Giving Hearts Day\"],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Today, Dakota Medical Foundation, Impact Institute and Alex Stern Family Foundation are hosting\\n                        the 10th annual Giving Hearts Day. You can explore and discover meaningful, joyful ways to\\n                        impact your community by supporting the work of local nonprofit organizations. For one day\\n                        only, DMF and other generous donors will match donations of $10 or more made through\\n                        givingheartsday.org to the charitable causes listed here. All the participating nonprofits\\n                        have received in-depth fundraising training and are ready to use your gifts to improve the\\n                        lives of people around you.\"],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"btn-primary btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollTo\",\"donate\"]],[\"flush-element\"],[\"text\",\"Donate Now\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"social\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Share Giving Hearts Day\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"btn-text btn-red\"],[\"static-attr\",\"href\",\"http://twitter.com/share?text=I+gave+on+%23givingheartsday\"],[\"static-attr\",\"target\",\"_blank\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon icon-twitter\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"btn-text btn-red\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"shareOnFacebook\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon icon-facebook2\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/home.hbs" } });
});
define("impact-public/templates/loading", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "VzxqkaMB", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"background-color\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-spinner sk-spinner-fading-circle\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle1 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle2 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle3 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle4 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle5 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle6 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle7 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle8 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle9 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle10 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle11 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle12 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/loading.hbs" } });
});
define("impact-public/templates/recover", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "z32W0mF9", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Password Reset\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"change-password\"],[\"static-attr\",\"style\",\"margin-top: 70px;\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 col-md-offset-3\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Change Account Password\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"errors\"]]],null,3],[\"block\",[\"if\"],[[\"get\",[\"emailSent\"]]],null,1,0],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form-horizontal\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendEmail\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Please enter your email address below. We'll send an email to you with a new password.\"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"class\",\"col-md-3 control-label\"],[\"flush-element\"],[\"text\",\"Email Address\"],[\"close-element\"],[\"text\",\"\\n\\n                      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9\"],[\"flush-element\"],[\"text\",\"\\n                          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"class\",\"value\",\"type\",\"placeholder\",\"required\"],[\"form-control\",[\"get\",[\"email\"]],\"text\",\"Email\",\"required\"]]],false],[\"text\",\"\\n                      \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue\"],[\"flush-element\"],[\"text\",\"Send Email\"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"We have sent you an email with a new password.\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"Make sure to check your spam folder in you do not receive\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                  the email in the next 15 minutes.\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group marg-t\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"https://impactgiveback.org/app/#/signin?signup=false\"],[\"static-attr\",\"style\",\"text-decoration: none\"],[\"flush-element\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue\"],[\"flush-element\"],[\"text\",\"Login\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"error\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"error\"]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-danger\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"errors\"]]],null,2],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/recover.hbs" } });
});
define("impact-public/templates/signin", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "4GPfPRgF", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"toCheckout\"]]],null,16,13],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"alerts\"]]],null,10],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"toCheckout\"]]],null,8],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row-fluid\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"signin\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"signup\"]]],null,7,5],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"signup\"]]],null,4,2],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-1\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"signin-or\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"or\"],[\"flush-element\"],[\"text\",\"or\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 marg-t\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-connect\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"signinFacebook\"],[[\"on\"],[\"click\"]]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-facebook2\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Connect with Facebook\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-connect\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"signinGoogle\"],[[\"on\"],[\"click\"]]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-google\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Connect with Google\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"guestCheckout\"]],[\"flush-element\"],[\"text\",\"Continue as guest\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"​Forgot your password?\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"signin\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Email\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"email\",[\"get\",[\"email\"]],\"Email\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Password\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"password\",[\"get\",[\"password\"]],\"Password\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"block\",[\"link-to\"],[\"recover\"],null,1],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"allowGuest\"]]],null,0],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"guestCheckout\"]],[\"flush-element\"],[\"text\",\"Or continue as guest\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"signup\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"First Name\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"text\",[\"get\",[\"firstName\"]],\"First Name\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Last Name\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"text\",[\"get\",[\"lastName\"]],\"Last Name\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Email\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"email\",[\"get\",[\"email\"]],\"Email\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Confirm Email address\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"email\",[\"get\",[\"confirmEmail\"]],\"Re-type Email\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Password\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"password\",[\"get\",[\"password\"]],\"Password\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Confirm Password\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"required\",\"disabled\"],[\"password\",[\"get\",[\"confirmPassword\"]],\"Password\",\"form-control\",true,[\"get\",[\"loading\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn-primary btn-lt-blue\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"loading\"]],null],[\"flush-element\"],[\"text\",\"Sign Up\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"allowGuest\"]]],null,3],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n                Need an account?\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleSignUp\"]],[\"flush-element\"],[\"text\",\" Sign Up\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                      \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Lets you to schedule recurring gifts to your favorite \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITIES\"]]],null],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Create an Account\"],[\"close-element\"],[\"text\",\"\\n                Already have an account? \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleSignUp\"]],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clearfix\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clearfix\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Creating an account will:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Allow you track all your donations on \"],[\"append\",[\"unknown\",[\"LABELS\",\"URL\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Provide access to donation receipts for tax purposes year-round\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"mode\",\"is_impact_app\"]]],null,6],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Don't want to create an account?\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"guestCheckout\"]],[\"flush-element\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn-primary btn-blue-outline\"],[\"flush-element\"],[\"text\",\"Continue as a Guest\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 hidden-xs\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"ol\",[]],[\"static-attr\",\"class\",\"wizard-progress clearfix\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"1\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"\\n                        Review\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"active-step\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"2\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name-active\"],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"3\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Payment\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-num\"],[\"flush-element\"],[\"text\",\"4\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"step-name\"],[\"flush-element\"],[\"text\",\"Thank You\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"alerts\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"alert\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row-fluid\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"alert alert-warning\"],[\"static-attr\",\"role\",\"alert\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"Please check the following:\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"alerts\"]]],null,9],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"My Account\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header ghd\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"My Account\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"ghd\",\"isGHD\"]]],null,12,11]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Checkout\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header ghd\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Checkout\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"ghd\",\"isGHD\"]]],null,15,14]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/signin.hbs" } });
});
define("impact-public/templates/thank-you", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "7u1NFxcw", "block": "{\"statements\":[[\"open-element\",\"nav\",[]],[\"static-attr\",\"class\",\"navbar navbar-default\"],[\"static-attr\",\"id\",\"myDropdown\"],[\"static-attr\",\"role\",\"navigation\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-header\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-brand\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"images/GHD_logo2017.png\"],[\"static-attr\",\"alt\",\"Giving Hearts Logo\"],[\"static-attr\",\"title\",\"Giving Hearts Logo\"],[\"static-attr\",\"class\",\"countdown-logo\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"herophoto-thankyou\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ticker-thankyou\"],[\"flush-element\"],[\"text\",\"Thank you!\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"tickermoneysign\"],[\"flush-element\"],[\"open-element\",\"sup\",[]],[\"flush-element\"],[\"text\",\"$\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ticker\"],[\"flush-element\"],[\"append\",[\"helper\",[\"money-rounded\"],[[\"get\",[\"donationsSoFar\"]]],null],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"tickerwords-thankyou\"],[\"flush-element\"],[\"text\",\"Raised this year\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"countdown-footer\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/thank-you.hbs" } });
});
define("impact-public/templates/volunteer", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1OJUZ7wp", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/volunteer.hbs" } });
});
define("impact-public/templates/volunteer/events/all", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Fic5azo7", "block": "{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"model\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"append\",[\"helper\",[\"volunteer-box\"],null,[[\"opportunity\"],[[\"get\",[\"opportunity\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"opportunity\"]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/volunteer/events/all.hbs" } });
});
define("impact-public/templates/volunteer/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ZcwYimXD", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"donate-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Find a Volunteer Opportunity\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Use the search box, type, or category filter to find a volunteer opportunity that aligns\\n                with the experience that you are looking for. When you find an opportunity that\\n                interests you, simply apply for that opportunity within the volunteer description. Your\\n                information will go directly to the \"],[\"append\",[\"helper\",[\"to-lower-case\"],[[\"get\",[\"LABELS\",\"CHARITY\"]]],null],false],[\"text\",\" that posted the opportunity.\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-search\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row filters\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"aj-filter-boxes\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-group\"],[\"static-attr\",\"id\",\"accordion-type\"],[\"static-attr\",\"role\",\"tablist\"],[\"static-attr\",\"aria-multiselectable\",\"true\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"volunteer-sidebar-type\"],null,[[\"types\",\"type_options_checked\"],[[\"get\",[\"model\",\"types\"]],[\"get\",[\"type_options_checked\"]]]]],false],[\"text\",\"\\n\\n                        \"],[\"append\",[\"helper\",[\"volunteer-sidebar-skills\"],null,[[\"skills\",\"skill_options_checked\"],[[\"get\",[\"model\",\"skills\"]],[\"get\",[\"skill_options_checked\"]]]]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"text\",\"\\n\\n\"],[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nonprofit\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-7\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pad-l\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"id\"],[\"text\",[\"get\",[\"nameFilterText\"]],\"Search by Title or Description\",\"form-control search\",\"name-search-input\"]]],false],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon search\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"nameFilterText\"]]],null,26],[\"text\",\"                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-5\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"search-section\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"or\"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"postCodeSearch\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"callout-text input-group\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"value\",\"placeholder\",\"class\",\"focus-in\"],[\"text\",[\"get\",[\"zip\"]],\"Zip code\",\"form-control zip-code\",\"resetZip\"]]],false],[\"text\",\"\\n                                            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"within\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"class\"],[[\"get\",[\"miles\"]],\"radius\"]],25],[\"text\",\"                                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary btn-zip-code\"],[\"flush-element\"],[\"text\",\"Go\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"btn-group\"],[\"static-attr\",\"data-toggle\",\"buttons\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"btn \",[\"helper\",[\"if\"],[[\"get\",[\"ongoing\"]],\"active\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setVisibility\",\"ongoing\"]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"type\",\"radio\"],[\"static-attr\",\"name\",\"options\"],[\"dynamic-attr\",\"checked\",[\"unknown\",[\"ongoing\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                    Ongoing Opportunities\\n\"],[\"block\",[\"if\"],[[\"get\",[\"noResults\"]]],null,22,21],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"label\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"btn \",[\"helper\",[\"unless\"],[[\"get\",[\"ongoing\"]],\"active\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setVisibility\",\"oneTime\"]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"type\",\"radio\"],[\"static-attr\",\"name\",\"options\"],[\"dynamic-attr\",\"checked\",[\"unknown\",[\"oneTime\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                    One Time Opportunities\\n\"],[\"block\",[\"if\"],[[\"get\",[\"noResults\"]]],null,18,17],[\"text\",\"                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hasFilters\"]]],null,14],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-ongoing\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"searching\"]]],null,13,12],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Loading more...\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"scroll-load\"],null,[[\"isLoading\",\"action\",\"noMore\"],[[\"get\",[\"loadingMore\"]],\"getMore\",[\"get\",[\"no_more_event\"]]]],0]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    No one time opportunities match your search criteria.\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    \"],[\"append\",[\"helper\",[\"volunteer-box\"],null,[[\"opportunity\"],[[\"get\",[\"opportunity\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"opportunity\"]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"One Time Opportunities\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"eventOpportunitiesVisible\"]]],null,3,2],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"allFilter\"]]],null,1]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Loading more...\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"scroll-load\"],null,[[\"isLoading\",\"action\",\"noMore\"],[[\"get\",[\"loadingMore\"]],\"getMore\",[\"get\",[\"no_more_ongoing\"]]]],5]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    No ongoing opportunities match your search criteria.\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                    \"],[\"append\",[\"helper\",[\"volunteer-box\"],null,[[\"opportunity\"],[[\"get\",[\"opportunity\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"opportunity\"]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Ongoing Opportunities\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"ongoingOpportunitiesVisible\"]]],null,8,7],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"allFilter\"]]],null,6]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"ongoing\"]]],null,9,4]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"no-results\"],[\"flush-element\"],[\"text\",\"Your search did not match any results.\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"noResults\"]]],null,11,10]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-spinner sk-spinner-fading-circle\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle1 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle2 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle3 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle4 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle5 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle6 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle7 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle8 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle9 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle10 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle11 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"sk-circle12 sk-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"pull-right\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearSearchFilters\"]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                    Clear Filters\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            (\"],[\"append\",[\"unknown\",[\"eventOpportunitiesVisible\",\"length\"]],false],[\"text\",\")\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            (\"],[\"append\",[\"unknown\",[\"eventOpportunities\",\"length\"]],false],[\"text\",\")\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"allFilter\"]]],null,16,15]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        (0)\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            (\"],[\"append\",[\"unknown\",[\"ongoingOpportunitiesVisible\",\"length\"]],false],[\"text\",\")\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            (\"],[\"append\",[\"unknown\",[\"ongoingOpportunities\",\"length\"]],false],[\"text\",\")\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"allFilter\"]]],null,20,19]],\"locals\":[]},{\"statements\":[[\"text\",\"                                        (0)\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"unknown\",[\"option\",\"label\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"                                                    \"],[\"block\",[\"x-option\"],null,[[\"value\"],[[\"get\",[\"option\",\"value\"]]]],23],[\"text\",\"\\n\"]],\"locals\":[\"option\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"milesOptions\"]]],null,24]],\"locals\":[]},{\"statements\":[[\"text\",\"                                            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove-circle pull-right pad-r\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearSearchFilters\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/volunteer/index.hbs" } });
});
define("impact-public/templates/volunteer/opportunity", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "k/SX92jQ", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"volunteer-opportunity\"],[\"flush-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-header\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Apply to Volunteer\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"hr\",[]],[\"static-attr\",\"class\",\"divider blue\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"back-button\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"volunteer\"],null,13],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"charity-info\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"model\",\"op\",\"organization\",\"image\"]]]]],[\"static-attr\",\"alt\",\"\"],[\"static-attr\",\"class\",\"img-responsive\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Location\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"address\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"address\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"city\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"state\"]],false],[\"text\",\" \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"zip\"]],false],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hasContactInfo\"]]],null,12],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-9 col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"opportunity-info\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-8\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"op\",\"title\"]],false],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"hr\",[]],[\"static-attr\",\"class\",\"divider red\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"social\"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Share this Opportunity\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-facebook2\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-twitter\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"op\",\"organization\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"view-all-link\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"volunteer\",[\"helper\",[\"query-params\"],null,[[\"charity\"],[[\"get\",[\"opportunity\",\"organization\",\"id\"]]]]]],null,9],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"op\",\"description\"]],false],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-12\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4 col-xs-12 pad-r\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"op\",\"ongoing\"]]],null,8,6],[\"text\",\"                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4 col-xs-12 pad-l pad-r\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Categories\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"list-unstyled\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"op\",\"skills\"]]],null,4],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-4 col-xs-12 pad-l\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Requirements\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"op\",\"requirements\"]],false],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"userAlreadyApplied\"]]],null,3,0],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12 col-md-8 \"],[\"flush-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row volunteer-form\"],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Apply for this Opportunity\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"submitApplication\",[\"get\",[\"submission\"]]],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"ff-first-name\"],[\"flush-element\"],[\"text\",\"First name\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"id\",\"type\",\"class\",\"value\",\"required\"],[\"ff-first-name\",\"text\",\"form-control validate\",[\"get\",[\"submission\",\"first_name\"]],\"required\"]]],false],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"ff-last-name\"],[\"flush-element\"],[\"text\",\"Last name\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"id\",\"type\",\"class\",\"value\",\"required\"],[\"ff-last-name\",\"text\",\"form-control\",[\"get\",[\"submission\",\"last_name\"]],\"required\"]]],false],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"ff-email\"],[\"flush-element\"],[\"text\",\"Email\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"id\",\"type\",\"class\",\"value\",\"required\"],[\"ff-email\",\"email\",\"form-control\",[\"get\",[\"submission\",\"email\"]],\"required\"]]],false],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"ff-phone\"],[\"flush-element\"],[\"text\",\"Phone\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"append\",[\"helper\",[\"phone-number-input\"],null,[[\"extensions\",\"id\",\"type\",\"class\",\"value\",\"required\"],[false,\"ff-phone\",\"text\",\"form-control\",[\"get\",[\"submission\",\"phone\"]],\"required\"]]],false],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"ff-other-opportunities\"],[\"flush-element\"],[\"text\",\"Are there any other volunteer opportunities with us you'd be interested in?\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"id\",\"type\",\"class\",\"value\"],[\"ff-other-opportunities\",\"text\",\"form-control\",[\"get\",[\"submission\",\"other_interests\"]]]]],false],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"ff-notes\"],[\"flush-element\"],[\"text\",\"Comments\"],[\"close-element\"],[\"text\",\"\\n                                            \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"id\",\"class\",\"rows\",\"value\"],[\"ff-notes\",\"form-control\",\"5\",[\"get\",[\"submission\",\"notes\"]]]]],false],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n                                            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"type\",\"submit\"],[\"flush-element\"],[\"text\",\"Submit\"],[\"close-element\"],[\"text\",\"\\n                                        \"],[\"close-element\"],[\"text\",\"\\n                                    \"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"alert alert-info\"],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-thumbs-up\"],[\"flush-element\"],[\"close-element\"],[\"text\",\" Your application has been submitted for this volunteer opportunity. We will contact you shortly.\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"alert alert-info\"],[\"flush-element\"],[\"text\",\"You have previously applied for this volunteer opportunity.\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-xs-12\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"userPreviouslyApplied\"]]],null,2,1],[\"text\",\"                        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"skill\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"skill\"]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"time_commitment\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Date and Time\"],[\"close-element\"],[\"text\",\"\\n                            \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-calendar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"event_date\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-time\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n                                \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"model\",\"op\",\"start_time\"]],\"hh:mm a\",\"HH:mm:ss\"],null],false],[\"text\",\" -\\n                                \"],[\"append\",[\"helper\",[\"moment-format\"],[[\"get\",[\"model\",\"op\",\"end_time\"]],\"hh:mm a\",\"HH:mm:ss\"],null],false],[\"text\",\"\\n                            \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"op\",\"time_commitment\"]]],null,5]],\"locals\":[]},{\"statements\":[[\"text\",\"                                \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n                                    \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"time_commitment\"]],false],[\"text\",\"\\n                                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Time Commitment\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"op\",\"time_commitment\"]]],null,7]],\"locals\":[]},{\"statements\":[[\"text\",\"                            View Other Opportunities\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"contact_email\"]],false],[\"text\",\" \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                            \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"contact_name\"]],false],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"h6\",[]],[\"flush-element\"],[\"text\",\"Point of Contact\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"op\",\"contact_name\"]]],null,11],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"model\",\"op\",\"contact_email\"]]],null,10],[\"text\",\"\\n                        \"],[\"append\",[\"unknown\",[\"model\",\"op\",\"contact_phone\"]],false],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Back to All Opportunities\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "impact-public/templates/volunteer/opportunity.hbs" } });
});
define('impact-public/utils/api', ['exports', 'impact-public/config/environment', 'impact-public/utils/token', 'ember'], function (exports, _impactPublicConfigEnvironment, _impactPublicUtilsToken, _ember) {

    /* global $ */

    /*
     * Jquery REST method overrides
     */

    //$.ajaxSetup({
    //    cache: false
    //});

    var api = {
        stripeClient: _impactPublicConfigEnvironment['default'].stripeClient,
        stripeReturn: _impactPublicConfigEnvironment['default'].stripeReturn,
        isGivingHeartsDay: _impactPublicConfigEnvironment['default'].isGivingHeartsDay,
        startGivingHeartsDay: _impactPublicConfigEnvironment['default'].startGivingHeartsDay,
        endGivingHeartsDay: _impactPublicConfigEnvironment['default'].endGivingHeartsDay,
        url: _impactPublicConfigEnvironment['default'].api.url,
        //stripeClient: null,
        //url: "https://impact-api-staging.herokuapp.com",
        //token: null,
        get: function get(url, data, callback, auth, file) {
            return api.call('GET', url, data, callback, auth, file);
        },
        post: function post(url, data, callback, auth, file) {
            data._method = 'POST';
            return api.call('POST', url, data, callback, auth, file);
        },
        put: function put(url, data, callback, auth, file) {
            data._method = 'PUT';
            return api.call('PUT', url, data, callback, auth, file);
        },
        del: function del(url, data, callback, auth, file) {
            data._method = 'DELETE';
            return api.call('DELETE', url, data, callback, auth, file);
        },
        call: function call(type, url, data, callback, auth, file) {
            // Add Authentication
            if (auth) {
                data._token = data._token = _impactPublicUtilsToken['default'].get('token');
            }

            var method;
            //var crossDomain;

            url = api.url + url;

            if (file) {
                return $.ajax({
                    url: url,
                    type: 'POST'
                }).done(callback);
            } else {
                if ($('html').is('.ie8')) {
                    method = 'GET';
                    // Url
                    url = url + '?callback=?';
                } else if ($('html').is('.ie9')) {
                    method = 'GET';
                    url = url + '?callback=?';
                } else {
                    method = type;
                }

                // Call
                return $.ajax({
                    type: method,
                    url: url,
                    data: data,
                    dataType: "json",
                    cache: false,
                    crossDomain: true,
                    success: function success(json) {
                        if (json.error !== undefined && json.code === 500) {
                            _ember['default'].get('Router.router').transitionTo('logout');
                        } else {
                            callback(json);
                        }
                    },
                    error: function error(_error) {
                        var message = 'Something went wrong, please refresh the page and try again in a few minutes.';
                        callback({
                            error: message,
                            message: message
                        });
                        console.log('api util error', _error);
                    }
                });

                //return $.getJSON(url, data, function(json) {
                //    // Force Logout
                //    if (json.error !== undefined && json.code === 500) {
                //        //debugger;
                //        Ember.get('Router.router').transitionTo('logout');
                //        //this.transitionTo('logout');
                //    } else {
                //        callback(json);
                //    }
                //});
            }
        }
    };

    // Ember.RestAdapter.reopen({
    //     queryFailed: function(record, json) {
    //         if (record.error === "Invalid token sent") {
    //             App.get('Router.router').transitionTo('logout');
    //             App.Growl.info('Session expired. Please log in again.');
    //         }
    //     }
    // });

    exports['default'] = api;
});
/*
 *  Object to communicate with the API
 */
define('impact-public/utils/token', ['exports', 'ember'], function (exports, _ember) {

    var token = {
        get: function get() {
            if (!this.value) {
                this.value = _ember['default'].$.jStorage.get('token');
            }
            return this.value;
        },
        set: function set(token) {
            this.value = token;
            _ember['default'].$.jStorage.set('token', token);
        }
    };

    exports['default'] = token;
});
/*
 *  Manage user token persistence
 */
define('impact-public/utils/track', ['exports', 'impact-public/config/environment'], function (exports, _impactPublicConfigEnvironment) {

    /* global _gaq */

    exports['default'] = function (options) {
        if (_impactPublicConfigEnvironment['default'].isGivingHeartsDay && !_impactPublicConfigEnvironment['default'].isDevelopment && _impactPublicConfigEnvironment['default'].isImpactApp) {
            // category and action are required
            // label (string) and value (int) are optional
            //return function() {
            console.log("tracking", options);
            var value = null;
            // if(parseFloat(options.value) % 1 > 0){
            //     value = parseFloat(options.value) * 100
            // }

            if (options.value) {
                value = parseFloat(options.value);
                value = value * 100;
                value = parseInt(value);
            }

            _gaq.push(['_trackEvent', options.category ? options.category.toUpperCase() : "", options.action ? options.action.toUpperCase() : "", options.label ? options.label.toUpperCase() : "", value]);
        }
    };
});


define('impact-public/config/environment', ['ember'], function(Ember) {
  var exports = {'default': {"appName":"Impact Giveback","isImpactApp":true,"modulePrefix":"impact-public","environment":"staging","rootURL":"/","locationType":"hash","META":{"full_url":"https://giving.impactgiveback.org/","title":"Giving Hearts Day 2017","description":"I am a Giving Heart! Join me at impactgiveback.org. #givinghearts17","image":"https://giving.impactgiveback.org/images/GivingHeartsDay2017.jpg"},"FB":{"appId":"590342487761357","version":"v2.1"},"googleAnalytics":{"webPropertyId":"UA-59394579-1"},"EmberENV":{"FEATURES":{},"EXTEND_PROTOTYPES":{"Date":false}},"browserUpdate":{"vs":{"i":9,"f":2,"o":9.63,"s":2,"c":10}},"APP":{"name":"impact-public","version":"0.0.0+"},"auth":{"gapi":"821803660680-9n1476ol1vvurmtbbeg77k3us9v0bi9g.apps.googleusercontent.com"},"share_url":"https://giving.impactgiveback.org","stripe":{"publishableKey":"pk_test_xZVVBamIH8dwg6Z3hx6GF6fj"},"api":{"url":"http://impact-api-staging.herokuapp.com"},"stripeClient":"ca_5DIzUZnqN1fmzd8uqyxHfJfZR7zxMFHb","pusherKey":"6959dc46623f980151f8","startGivingHeartsDay":1512108000,"endGivingHeartsDay":1514703600,"isGivingHeartsDay":false,"isDevelopment":false,"stripeReturn":"http://impact-api-staging.herokuapp.com/stripe/return","contentSecurityPolicy":{"default-src":"'none'","font-src":"'self' fonts.gstatic.com localhost:8888 localhost:4200","connect-src":"'self' localhost:8092 wss://ws.pusherapp.com/ impact-api-staging.herokuapp.com impact-api.herokuapp.com lendahand-api-staging.herokuapp.com lendahand-api.herokuapp.com lendahandup.flywheelsites.com","img-src":"'self' s3.amazonaws.com uploads.impactgiveback.org www.facebook.com staging.giving.impactgiveback.org uploads.impactgiveback.org.s3-us-west-2.amazonaws.com www.google-analytics.com localhost:8888 lendahandup.flywheelsites.com","style-src":"'self' 'unsafe-inline' fonts.googleapis.com localhost:8888 localhost:4200","media-src":"'self' localhost:8888","script-src":"'self' 'unsafe-eval' 'unsafe-inline' localhost:8092 localhost:8888 d3dy5gmtp8yhk7.cloudfront.net stats.pusher.com apis.google.com connect.facebook.net www.google-analytics.com connect.facebook.net browser-update.org/update.js js.stripe.com timeline10.pusher.com *.pusher.com lendahandup.flywheelsites.com","frame-src":"'self' www.youtube.com accounts.google.com static.ak.facebook.com s-static.ak.facebook.com js.stripe.com www.facebook.com staticxx.facebook.com localhost:8888"},"contentSecurityPolicyHeader":"Content-Security-Policy-Report-Only","exportApplicationGlobal":true}};Object.defineProperty(exports, '__esModule', {value: true});return exports;
});

if (!runningTests) {
  require("impact-public/app")["default"].create({"name":"impact-public","version":"0.0.0+"});
}
//# sourceMappingURL=impact-public.map
