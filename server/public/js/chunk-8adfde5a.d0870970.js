(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-8adfde5a"],{"348e":function(s,e,a){},7244:function(s,e,a){"use strict";var t=a("9207"),r=a.n(t);r.a},9207:function(s,e,a){},dbc92:function(s,e,a){"use strict";a.r(e);var t=function(){var s=this,e=s.$createElement,t=s._self._c||e;return t("div",{staticClass:"main"},[t("header",{staticClass:"container flex-between"},[t("router-link",{attrs:{tag:"div",to:"/",id:"logo"}},[t("figure",{staticClass:"image is-48x48"},[t("img",{attrs:{src:a("b8b2")}})]),t("h2",{staticClass:"subtitle"},[s._v("\n          StopOver\n          "),t("br"),s._v("Chat\n        ")])])],1),t("div",{staticClass:"columns"},[t("div",{staticClass:"box has-text-centered center column is-three-quarters-mobile is-one-third-desktop is-one-quarter-fullhd"},[t("h3",{staticClass:"title"},[s._v("PREMIUM")]),s._m(0),s._m(1),t("div",{staticClass:"flex-center"},[t("button",{staticClass:"button is-success",on:{click:function(e){s.modalActive=!0}}},[s._v("Try for free")])])])]),t("div",{staticClass:"modal",class:{"is-active":s.modalActive}},[t("div",{staticClass:"modal-background"}),t("div",{staticClass:"modal-content"},[t("app-signup")],1),t("button",{staticClass:"modal-close is-large",attrs:{"aria-label":"close"},on:{click:function(e){s.modalActive=!1}}})])])},r=[function(){var s=this,e=s.$createElement,a=s._self._c||e;return a("p",{staticClass:"title"},[s._v("\n          $1.99\n          "),a("sup",[s._v("/ month")])])},function(){var s=this,e=s.$createElement,a=s._self._c||e;return a("ul",[a("li",[a("i",{staticClass:"fas fa-check"}),s._v(" Create as many rooms as you want\n          ")]),a("li",[a("i",{staticClass:"fas fa-check"}),s._v(" Use the app with no limitation\n          ")]),a("li",[a("i",{staticClass:"fas fa-check"}),s._v(" Try one month for free\n          ")]),a("li",[a("i",{staticClass:"fas fa-check"}),s._v(" No engagement. Stop when you want to\n          ")])])}],i=function(){var s=this,e=s.$createElement,a=s._self._c||e;return a("div",[a("section",{staticClass:"box"},[s.alert?s._e():a("form",{on:{submit:function(e){return e.preventDefault(),s.validateBeforeSubmit(e)}}},[a("b-field",{attrs:{label:"Email"}},[a("p",{staticClass:"control has-icon has-icon-right"},[a("input",{directives:[{name:"model",rawName:"v-model",value:s.email,expression:"email"},{name:"validate",rawName:"v-validate",value:"required|email",expression:"'required|email'"}],class:{input:!0,"is-danger":s.errors.has("email")},attrs:{name:"email",type:"text",placeholder:"Email"},domProps:{value:s.email},on:{input:function(e){e.target.composing||(s.email=e.target.value)}}}),a("i",{directives:[{name:"show",rawName:"v-show",value:s.errors.has("email"),expression:"errors.has('email')"}],staticClass:"fa fa-warning"}),a("span",{directives:[{name:"show",rawName:"v-show",value:s.errors.has("email"),expression:"errors.has('email')"}],staticClass:"help is-danger"},[s._v("Email is not valid")])])]),a("b-field",{attrs:{label:"Password"}},[a("p",{staticClass:"control has-icon has-icon-right"},[a("input",{directives:[{name:"model",rawName:"v-model",value:s.password,expression:"password"},{name:"validate",rawName:"v-validate",value:"required|min:8",expression:"'required|min:8'"}],class:{input:!0,"is-danger":s.errors.has("password")},attrs:{name:"password",type:"password",placeholder:"Enter password"},domProps:{value:s.password},on:{input:function(e){e.target.composing||(s.password=e.target.value)}}}),a("i",{directives:[{name:"show",rawName:"v-show",value:s.errors.has("password"),expression:"errors.has('password')"}],staticClass:"fa fa-warning"}),a("span",{directives:[{name:"show",rawName:"v-show",value:s.errors.has("password"),expression:"errors.has('password')"}],staticClass:"help is-danger"},[s._v("Password must be 8 characters at least")])])]),a("b-field",{attrs:{label:"Confirm password",type:{"is-danger":s.errors.has("confirm-password")},message:[{"You must confirm password":s.errors.firstByRule("confirm-password","required"),"Passwords are not the same":s.errors.firstByRule("confirm-password","is")}]}},[a("b-input",{directives:[{name:"validate",rawName:"v-validate",value:{required:!0,is:s.password},expression:"{ required: true, is: password }"}],attrs:{type:"password",placeholder:"Enter password again",name:"confirm-password"},model:{value:s.confirmPassword,callback:function(e){s.confirmPassword=e},expression:"confirmPassword"}})],1),a("button",{staticClass:"button is-primary",attrs:{type:"submit"}},[s._v("Register")])],1),s.alert?a("div",{staticClass:"has-text-centered"},[s._m(0),a("p",[s._v("This is a demo version")]),a("p",[s._v("YOU WILL NOT BE DEBITED")]),a("br"),a("p",[s._v('YOU MUST ENTER "4242 4242 4242 4242" AS CARD NUMBER')]),a("p",[s._v("It will simulate a real payment")]),a("button",{staticClass:"button is-warning",on:{click:s.createStripe}},[s._v("OK")])]):s._e()])])},o=[function(){var s=this,e=s.$createElement,a=s._self._c||e;return a("p",[a("i",{staticClass:"far fa-grin-beam fa-2x"}),s._v("You will be redirected to the payment page !")])}],n=a("8021"),l={data:function(){return{email:null,password:null,confirmPassword:null,alert:!1}},created:function(){this.$cookies.isKey("user")&&(this.alert=!0)},methods:{createStripe:function(){var s=Stripe("pk_test_oevDNgnDf7MryOlZOKGdT3AV");s.redirectToCheckout({items:[{plan:"plan_FaLwspsa2HreoF",quantity:1}],successUrl:"https://stopover-chat.herokuapp.com/success",cancelUrl:"https://stopover-chat.herokuapp.com/error",customerEmail:this.$store.getters.userEmail}).then(function(s){s?this.displaySuccess("You succesfully registered"):this.displayError("We are not able to register you")})},validateBeforeSubmit:function(){var s=this;this.$validator.validateAll().then(function(e){if(e){var a={email:s.email,password:s.confirmPassword};n["a"].createUser(a).then(function(e){s.displaySuccess(e.success),s.$store.state.user=e.user,s.$store.state.isConnected=!0,s.alert=!0}).catch(function(e){s.displayError(e),s.email=s.password=s.confirmPassword=null})}else s.$buefy.toast.open({message:"Form is not valid !",type:"is-danger",position:"is-bottom"})})},displayError:function(s){this.$buefy.toast.open({message:s,type:"is-danger",position:"is-bottom",duration:5e3})},displaySuccess:function(s){this.$buefy.toast.open({message:s,type:"is-success",position:"is-bottom",duration:5e3})}}},c=l,u=(a("fb99"),a("2877")),d=Object(u["a"])(c,i,o,!1,null,"37e7e364",null),m=d.exports,p={components:{"app-signup":m},data:function(){return{modalActive:!1}}},v=p,f=(a("7244"),Object(u["a"])(v,t,r,!1,null,"248508e7",null));e["default"]=f.exports},fb99:function(s,e,a){"use strict";var t=a("348e"),r=a.n(t);r.a}}]);
//# sourceMappingURL=chunk-8adfde5a.d0870970.js.map