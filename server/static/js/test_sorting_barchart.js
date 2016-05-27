describe('sortchooser behavior', function()
{
    it("x are correctly in ascending order", function(){
        jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';
        loadFixtures('test_sorting_barchart.html');
        $(document).ready(function()
        {
            ($('#sort-type')).val("value").change();
        });
        var bars = document.getElementsByTagName("rect");
        for(i=0;i<bars.length-1;i++){
            expect(bars[i].getAttribute("x")).toBeLessThan(bars[i+1].getAttribute("x"));
        }
    })
});
