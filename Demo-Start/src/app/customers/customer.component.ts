import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { Customer } from './customer';

// Nested formGroup Custom Validator
function emailMatcher(c: AbstractControl): {[key: string]: boolean }| null {
  const emailControl = c.get('email');
  const confirmEmailControl = c.get('confirmEmail');
  if(emailControl.pristine || confirmEmailControl.pristine)
    return null;
  if (emailControl.value === confirmEmailControl.value)
    return null;
  return { 'match': true };
}

// // Custom validator
// function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
//   if(c.value !== null && (isNaN(c.value)  || c.value < 1 || c.value > 5))
//     return { 'range': true };
//   return null
// }

// Custom validator with params
function ratingRange(min: number , max: number): ValidatorFn {  // ==> ratingRange func is a Factory Function
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if(c.value !== null && (isNaN(c.value)  || c.value < min || c.value > max))
      return { 'range': true };
    return null
  }
}


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {

    // Create FormGroup using FormBuilder
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: [{value: '', disabled: false}, [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.email, Validators.required]],
        confirmEmail: ['', Validators.required],
      }, {validator: emailMatcher}),
      phone: '',
      notification:'email',
      rating: ['null', ratingRange(1, 5)],
      sendCatalog: true
    })

    // // Create FormGroup
    // this.customerForm = new FormGroup({
    //   firstName: new FormControl(),
    //   lastName: new FormControl(),
    //   email: new FormControl(),
    //   sendCatalog: new FormControl(true)
    // })
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  // Func adjusts validators dynamicaly , invoked when notification radio buttons clicked
  setNotification(ntotifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (ntotifyVia == 'text')
      phoneControl.setValidators(Validators.required); // single validator; if multiple: []
    else
      phoneControl.clearValidators();
    phoneControl.updateValueAndValidity(); // revaluate the phone formControl state of validation (essential)
  }

  // Populate test data
  populateTestData() {

    // Complete Fill
    this.customerForm.setValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      email: 'jack@example.com',
      sendCatalog: false
    })

    // // Partial Fill
    // this.customerForm.patchValue({
    //   firstName: 'Jack',
    //   email: 'jack@example.com',
    // })
  }
}
