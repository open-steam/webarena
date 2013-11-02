var request = require('superagent');
var expect = require('chai').expect;
var should = require('chai').should();

var net = require('net');

describe('TcpServer', function () {
	it('tcp server should be running', function (done) {
		var client = net.connect(8125, function () {
			done();
		});
	});


	it('should return error if request type missing', function (done) {
		this.timeout(3000);
		var client = net.connect(8125, function () {
			this.on('data', function (data) {
				var response = JSON.parse(data.toString());
				expect(response).to.be.an("object");
				expect(response).to.have.property('error');
				done();
			});
			client.write("....");
			//setTimeout(done, 1);
		});
	});
});

describe('TCP subscribe events', function () {
	var client;
	beforeEach(function (done) {
		client = net.connect({port: 8125}, function () {
			done();
		});
	});

	afterEach(function(){
		client.end();
	})

	it('should return error if eventlist is missing', function (done) {
		this.timeout(3000);

		client.on('data', function (data) {
			var response = JSON.parse(data.toString());
			expect(response).to.be.an("object");
			expect(response).to.have.property('error');
			done();
		});

		var subscriptionEvent = {
			requestType: "subscribeEvents"
		};

		client.write(JSON.stringify(subscriptionEvent));
	});

	it('should return success for event subscription', function (done) {
		this.timeout(3000);

		client.on('data', function (data) {
			var response = JSON.parse(data.toString());
			expect(response).to.be.an("object");
			expect(response).to.have.property('status');
			expect(response.status).to.be.eql("ok");
			done();
		});

		var subscriptionEvent = {
			requestType: "subscribeEvents",
			eventlist: "**"
		};

		client.write(JSON.stringify(subscriptionEvent));
	});
});