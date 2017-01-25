import * as Core from "../../src/core"
import { TsDecorator } from "../../src/transformers/ts-decorator"
import { JsParser } from "../helper"
import * as Chai from "chai"


describe("TsDecorator", () => {

    it("Should identify method decorator properly", () => {
        let ast = JsParser.getAst(`
        tslib_1.__decorate([
            decoOne("param"),
            tslib_1.__param(0, decoOne("param")),
            tslib_1.__metadata("design:type", Function),
            tslib_1.__metadata("design:paramtypes", [Object]),
            tslib_1.__metadata("design:returntype", void 0)
        ], MyClass.prototype, "myMethod", null);
        `)
        let dummy = new TsDecorator();
        let parent = <Core.ParentMetaData>{
            type: "Module",
            name: "MyModule",
            analysis: Core.AnalysisType.Valid,
            children: [<Core.ClassMetaData>{
                type: "Class",
                name: "MyClass",
                analysis: Core.AnalysisType.Valid,
                methods: [{
                    type: "Method",
                    name: "myMethod",
                    analysis: Core.AnalysisType.Valid,
                    parameters: [<Core.ParameterMetaData>{
                        type: "Parameter",
                        name: "par1"
                    }]
                }]
            }]
        }
        dummy.transform(ast, parent);
        let clazz = <Core.ClassMetaData>parent.children[0];
        Chai.expect(clazz.methods[0].decorators[0]).deep.eq(<Core.DecoratorMetaData>{
            type: "Decorator",
            name: "decoOne",
            analysis: Core.AnalysisType.Valid,
            location: {
                column: 12, line: 3
            },
            parameters: [<Core.MetaData>{
                type: "Parameter",
                name: "param",
                analysis: Core.AnalysisType.Valid,
                location: {
                    column: 20, line: 3
                }
            }]
        });
    })

    it("Should identify class decorator properly", () => {
        let ast = JsParser.getAst(`
        MyClass = tslib_1.__decorate([
            decoOne("param"),
            tslib_1.__metadata("design:paramtypes", [])
        ], MyClass);
        `)
        let dummy = new TsDecorator();
        let parent = <Core.ParentMetaData>{
            type: "Module",
            name: "MyModule",
            analysis: Core.AnalysisType.Valid,
            children: [<Core.ClassMetaData>{
                type: "Class",
                name: "MyClass",
                analysis: Core.AnalysisType.Valid,
                methods: []
            }]
        }
        dummy.transform(ast, parent);
        let clazz = <Core.ClassMetaData>parent.children[0];
        Chai.expect(clazz.decorators[0]).deep.eq(<Core.DecoratorMetaData>{
            type: "Decorator",
            name: "decoOne",
            analysis: Core.AnalysisType.Valid,
            location: {
                column: 12, line: 3
            },
            parameters: [<Core.MetaData>{
                type: "Parameter",
                name: "param",
                analysis: Core.AnalysisType.Valid,
                location: {
                    column: 20, line: 3
                }
            }]
        });
    })

    

    it("Should not error if provided TS class", () => {
        let ast = JsParser.getAst(`
        var MyClass = (function () {
            function MyClass() {
            }
            MyClass.prototype.myMethod = function (par1) { };
            return MyClass;
        }());
        `)
        let dummy = new TsDecorator();
        let parent = <Core.ParentMetaData>{
            type: "Module",
            name: "MyModule",
            analysis: Core.AnalysisType.Valid,
            children: [<Core.ClassMetaData>{
                type: "Class",
                name: "MyClass",
                analysis: Core.AnalysisType.Valid,
                methods: []
            }]
        }
        dummy.transform(ast, parent);
        let clazz = <Core.ClassMetaData>parent.children[0];
        Chai.expect(clazz.decorators).undefined;
    })
})