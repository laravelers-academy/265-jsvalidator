class JSValidator {

	status = false;

	errors = [];

	via = 'http';

	validators = {
		minLength: 3,
		maxLangth: 255,
	}

	msg = {
		required: `Este campo es requerido.`,
		minLength: `Longitud no válida. Minimo __minLength__ caracteres.`,
		maxLength: `Longitud no válida. Máximo __maxLength__ caracteres.`,
		email: `El campo de email no es válido`,
		integer: `Por favor coloca un número entero`,
		alphanumeric: `Solo se permiten letras y números sin espacios`,
		url: `Escribe una URL válida. Indica el protocolo http:// o https://`
	}

	constructor (formId) {

		this.setForm(formId);

		this.setInputs();

		this.parseInputs();

	}

	setForm (formId) {

		this.form = document.getElementById(formId);

	}

	setInputs () {

		this.inputs = document.querySelectorAll(`#${this.form.id} .jsValidator`);

	}

	setAjax() {

		this.via = 'ajax';

		return this;

	}

	setHttp() {

		this.via = 'http';

		return this;

	}

	parseInputs () {

		this.inputs.forEach( input => {

			this.appendErrorsTag(input);

		});

	}

	appendErrorsTag (input) {

		let parent = input.parentNode;

		let span = document.createElement('span');

		span.setAttribute("class", "error-msg");

		parent.appendChild(span);

	}

	validateForm() {

		this.form.addEventListener('submit', (e) => {

			// Reiniciar los errores y cambiar status a true
			this.resetValidation();

			// Recorrer cada uno de los inputs
			this.inputs.forEach( input => {

				// Validar cada input
				this.validateInput(input);

			});

			if(!this.status) {

				// Prevenir el envio del formulario
				e.preventDefault();

			} else {

				// Evaluar si se debe enviar por ajax o http
				if(this.via == 'ajax'){

					e.preventDefault();

					this.submitHandler();

				} else{

					// Solo para fines demostrativos
					e.preventDefault();

					console.log('Se ha enviado con el navegador');

				}
				

			}

		});

	}

	validateInputs() {

		this.inputs.forEach( input => {

			input.addEventListener('input', (e) => {

				this.resetValidation();

				this.validateInput(input);

			});

		});

	}

	validateInput (input) {

		let validators = input.dataset.validators;

		if (validators !== undefined) {

			validators = validators.split(' ');

			validators.forEach( validator => {

				/*
					Si el validador es required =>  su método de validación sería: _required(input)
					Si el validador es length =>  su método de validación sería: _length(input)
		
				*/

				this[`_${validator}`](input);

			});

		}

	}

	setError(input, msg)
	{

		// Cambiando el valor de estatus
		this.status = false;

		this.setStackError(input, msg);

		this.setErrorMessage(input, msg);

	}

	setStackError (input, msg)
	{

		// Añadir el error a nuestro stack de errores
		this.errors.push({input: input, msg: msg});

	} 

	setErrorMessage (input, msg)
	{
		
		// Adjuntando el error
		let span = input.nextElementSibling;

		span.innerHTML += (msg + '<br />');

	}

	resetValidation() {

		// Cambiando el valor de estatus
		this.status = true;

		this.resetStackError();

		this.resetErrorMessages();

	}

	resetStackError () {

		// Pila de errores
		this.errors = [];

	}

	resetErrorMessages () {

		// Quitar mensajes de error
		let spans = document.querySelectorAll(`#${this.form.id} .error-msg`);

		spans.forEach( span => {

			span.innerHTML = "";

		});

	}

	submitHandler() {

		let data = new FormData(this.form);

		fetch(this.form.action, {
			method: this.form.method,
			body:data
		})
		.then(response => response.json())
		.then(data => {

			console.log(data);

		})
		.catch(error => {

			console.log(error);

		});

	}

	init() {

		this.validateForm();

		this.validateInputs();

		return this;

	}

}

/**
 * Este método permite añadir errores a partir de un objeto externo
 * en este caso el objeto de errores es el que es devuelto por Laravel
 */
JSValidator.prototype.appendExternalErrors = function (errors){

  Object.entries(errors).forEach(([key, value]) => {

      let input = document.querySelector(`#${this.form.id}  input[name=${key}]`);
      
      // Recuperar el nodo de span de error
      let span = input.nextElementSibling; 

      value.forEach( val => {

          span.innerHTML += val + '<br />';

      });

  });

};


JSValidator.prototype._required = function (input) {

	let value = input.value;

	let msg = this.msg.required;

	if( value.trim() === "" || value.length < 1 ) {

		this.setError(input, msg);

	}

};

JSValidator.prototype._length = function (input) {
  // En primer lugar vamos a recuperar el valor del input
  let value = input.value; // Determinar la longitud del input

  let inputLength = value.length; // Definir minLength

  let minLength = input.dataset.min_length !== undefined ? Number(input.dataset.min_length) : this.validators.minLength; // Definir maxLength

  let maxLength = input.dataset.max_length !== undefined ? Number(input.dataset.max_length) : this.validators.maxLength; // Declarar la variable msg

  let msg; // Verificar min length

  if (inputLength < minLength) {

    msg = `Longitud no válida. Mínimo ${minLength} caracteres`,

    this.setError(input, msg);

  } // Verificar max length


  if (inputLength > maxLength) {
    
    msg = `Longitud no válida. Máximo ${maxLength} caracteres`,
    
    this.setError(input, msg);

  }
  
};

JSValidator.prototype._email = function (input) {

	let value = input.value;

	let msg = this.msg.email;

	let pattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i);

	if(!pattern.test(value) && value.trim() != "") {

		this.setError(input, msg);

	}

}

JSValidator.prototype._integer = function(input) {
	
	let value = input.value;

	let msg = this.msg.integer;

	let pattern = new RegExp(/^[0-9]+$/);

	if(!pattern.test(value) && value.trim() !== "") {

		this.setError(input, msg);

	}

};

JSValidator.prototype._alphanumeric = function(input) {
	
	let value = input.value;

	let msg = this.msg.alphanumeric;

	let pattern = new RegExp(/^[a-zA-Z0-9]+$/);

	if( !pattern.test(value) && value.trim() !== "") {

		this.setError(input, msg);

	}

};

JSValidator.prototype._url = function(input) {
	
	// En primer lugar vamos a recuperar el valor del input
	let value = input.value;

	// Definir el mensaje de error
	let msg = this.msg.url;

	// expresión regular para validar url
	var pattern = new RegExp(/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);

	// En caso de que la validación falle mandar error.
    if (!pattern.test(value) && value.trim() != "") {

    	this.setError(input, msg);

    }

};

JSValidator.prototype._password_confirmation = function (input) {

  // En primer lugar vamos a recuperar el valor del input
  let value = input.value;

  // Vamos a crear un arreglo de inputs con el valor password
  let password_inputs = [];

  // Encontrar un input con el nombre contraseña
  this.inputs.forEach( input => {

    if(input.name == "password") password_inputs.push(input);

  });

  if(password_inputs.length == 0){

    this.setError(input, "No se ha encontrado un campo de contraseña para validar");

  }else {

    let password_input = password_inputs[0];

    if (password_input.value != value) {
    
      this.setError(input, "Los campos de contraseña no coinciden");
    
    }

  }

};

JSValidator.prototype._checked = function (input) {

  let msg = "Debes marcar esta casilla para continuar"; // expresión regular para validar integer

  if (!input.checked) {

    this.setError(input, msg);

  }

};