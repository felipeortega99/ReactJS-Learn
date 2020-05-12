import React, { Component } from "react";
import axios from "../../../axios-orders";
import Button from "./../../../components/UI/Button/Button";
import Spinner from "./../../../components/UI/Spinner/Spinner";
import classes from "./ContactData.module.css";
import Input from "./../../../components/UI/Input/Input";

class ContactData extends Component {
	state = {
		orderForm: {
			name: {
				elemntType: "input",
				elementConfig: {
					type: "text",
					placeholder: "Your Name",
				},
				value: "",
				validation: {
					required: true,
				},
				valid: false,
				touched: false,
			},
			street: {
				elemntType: "input",
				elementConfig: {
					type: "text",
					placeholder: "Street",
				},
				value: "",
				validation: {
					required: true,
				},
				valid: false,
				touched: false,
			},
			zipCode: {
				elemntType: "input",
				elementConfig: {
					type: "text",
					placeholder: "ZIP Code",
				},
				value: "",
				validation: {
					required: true,
					minLength: 5,
					maxLength: 5,
				},
				valid: false,
				touched: false,
			},
			country: {
				elemntType: "input",
				elementConfig: {
					type: "text",
					placeholder: "Country",
				},
				value: "",
				validation: {
					required: true,
				},
				valid: false,
				touched: false,
			},
			email: {
				elemntType: "input",
				elementConfig: {
					type: "text",
					placeholder: "Your E-Mail",
				},
				value: "",
				validation: {
					required: true,
				},
				valid: false,
				touched: false,
			},
			deliveryMethod: {
				elementType: "select",
				elementConfig: {
					options: [
						{ value: "fastest", displayValue: "Fastest" },
						{ value: "cheapest", displayValue: "Cheapest" },
					],
				},
				validation: {},
				value: "fastest",
				valid: true,
			},
		},
		isFormValid: false,
		loading: false,
	};

	orderHandler = (event) => {
		event.preventDefault();
		this.setState({ loading: true });
		const formData = {};
		for (let formElementId in this.state.orderForm) {
			formData[formElementId] = this.state.orderForm[formElementId].value;
		}

		const order = {
			ingredients: this.props.ingredients,
			price: this.props.price,
			orderData: formData,
		};

		axios
			.post("/orders.json", order)
			.then((res) => {
				this.setState({ loading: false });
				this.props.history.push("/");
			})
			.catch((error) => {
				console.log(error);
				this.setState({ loading: false });
			});
	};

	inputChangedHandler = (event, inputId) => {
		let isFormValid = true;
		const updatedOrderForm = { ...this.state.orderForm };
		const updatedFormElement = { ...updatedOrderForm[inputId] };

		updatedFormElement.value = event.target.value;
		updatedFormElement.valid = this.checkvalidity(
			updatedFormElement.value,
			updatedFormElement.validation
		);
		updatedFormElement.touched = true;
		updatedOrderForm[inputId] = updatedFormElement;

		for (let inputId in updatedOrderForm) {
			isFormValid = updatedOrderForm[inputId].valid && isFormValid;
		}

		this.setState({ orderForm: updatedOrderForm, isFormValid });
	};

	checkvalidity = (value, rules) => {
		let isValid = false;
		if (!rules) {
			return true;
		}
		if (rules.required) {
			isValid = value.trim() !== "" && isValid;
		}
		if (rules.minLength) {
			isValid = value.length >= rules.minLength && isValid;
		}
		if (rules.maxLength) {
			isValid = value.length <= rules.maxLength && isValid;
		}

		return isValid;
	};

	render() {
		const formElementArray = [];
		for (let key in this.state.orderForm) {
			formElementArray.push({
				id: key,
				config: this.state.orderForm[key],
			});
		}

		let form = (
			<form onSubmit={this.orderHandler}>
				{formElementArray.map((element) => (
					<Input
						key={element.id}
						elementType={element.config.elementType}
						elementConfig={element.config.elementConfig}
						value={element.config.value}
						invalid={!element.valid}
						touched={element.touched}
						shouldValidate={element.config.validation}
						changed={(event) => this.inputChangedHandler(event, element.id)}
					/>
				))}
				<Button btnType='Success' disabled={!this.state.isFormValid}>
					Order
				</Button>
			</form>
		);
		if (this.state.loading) {
			form = <Spinner />;
		}

		return (
			<div className={classes.ContactData}>
				<h4>Enter your Contact Data</h4>
				{form}
			</div>
		);
	}
}

export default ContactData;
