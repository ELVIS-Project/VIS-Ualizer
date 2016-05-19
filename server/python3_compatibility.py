import os
import unittest
from helpers.parsers import CSVParser, CoOccurrenceMatrixParser, JsonParser
from flask import Flask
from flask.ext.testing import TestCase
from main import example, hello
from examples import example_types

class CompatibilityTestCase(TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def create_app(self):
        app= Flask(__name__)
        app.config['TESTING'] = True
        return app

    def test_cooccurence_parser(self):
        pyver3 = CoOccurrenceMatrixParser("../data/truncated/Josquin-Des-Prez_Ave-Maria...-virgo-serena.csv").parse();

        self.assertIsInstance(pyver3, dict)

    def test_example_main(self):
        response = self.client.get(example('bar-graph'))
        self.assertTemplateUsed("example/bar-graph.html")

    def test_hello_main(self):
        response = self.client.get(hello())
        self.assertTemplateUsed('example-list.html')


if __name__ == '__main__':
    unittest.main()
