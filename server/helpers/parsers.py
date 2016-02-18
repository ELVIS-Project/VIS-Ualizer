import csv
import json


class CSVParser():
    def __init__(self, csv_file_path):
        csv_file = open(csv_file_path, "rb")
        self.csv_reader = csv.reader(csv_file, delimiter=',', quotechar="|")


class CoOccurrenceMatrixParser(CSVParser):
    def parse(self):
        output = dict()
        # Get the keys
        keys = self.csv_reader.next()
        # Read to output
        for row in self.csv_reader:
            output_row = dict()
            for index, value in enumerate(row):
                # Skip the first column
                if index != 0:
                    output_row[keys[index]] = value
            output[row[0]] = output_row
        return output


class JsonParser():
    def __init__(self, file_path):
        self.file = open(file_path, "rb")

    def parse(self):
        return json.load(self.file)
