/**
 * Created by shenjiao on 15/2/28.
 */
var Class = XUtil.Class;

var Person = new Class();

Person.include({
	init: function (name) {
		this.name = name;
	}
});

var person = new Person('peter');

console.log(person);

var Male = new Class(Person);

Male.include({
	init: function (name, sex) {
		Male.parentInit.call(this, name);
		this.sex = sex;
	},
	echo: function () {
		console.log(this.name);
	}
});

console.log(Male);

var male = new Male('peter', 'male');

console.log(male);

var Boy = new Class(Male);

Boy.include({
	init: function (name, sex, age, school) {
		Boy.parentInit.call(this, name, sex);
		this.age = age;
		this.school = school;
	},
	echo: function () {
		Boy.parentProto.echo.call(this);
		console.log(this.sex, this.age, this.school);
	}
});

var boy = new Boy('peter', 'male', 6, 'sanlihesanxiao'),
	boy2= new Boy('tom','male',7,'shit');

console.log(boy);
boy.echo();

console.log(Boy.instances);
console.log(Male.instances);