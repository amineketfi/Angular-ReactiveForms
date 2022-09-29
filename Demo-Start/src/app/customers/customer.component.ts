import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators,
         AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

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
  emailMessage: string

  // Getter for accessing form array addresses
  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }

  // Object for email error messages
  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  }

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
      sendCatalog: true,
      addresses: this.fb.array([ this.buildAddress() ])
    })

    // // Create FormGroup
    // this.customerForm = new FormGroup({
    //   firstName: new FormControl(),
    //   lastName: new FormControl(),
    //   email: new FormControl(),
    //   sendCatalog: new FormControl(true)
    // })

    // Watch for changes on the setNotification control
    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value)
      );

    // Watcher for email control
    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    );
  }

  // Add new Address  fields to the form
  addAddress(): void {
    this.addresses.push(this.buildAddress())
  }

  // Build a formGroup (addresses)
  buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    })
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage= '';
    if((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]
      ).join(' ');
    }
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

  // Populate test data (some data missing)
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
