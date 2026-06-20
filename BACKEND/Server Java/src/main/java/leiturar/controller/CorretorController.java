package leiturar.controller;

import leiturar.service.CorretorService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/corretor")
public class CorretorController {

    private final CorretorService service;

    public CorretorController(CorretorService service) {
        this.service = service;
    }

    @PostMapping("/corrigir")
    public Map<String, Object> corrigir(@RequestBody Map<String, Object> payload) {

        String livro = payload.get("livro").toString();
        String[] respostas = ((java.util.List<String>) payload.get("respostas")).toArray(new String[0]);

        int acertos = service.corrigir(livro, respostas);

        return Map.of(
                "livro", livro,
                "acertos", acertos,
                "total", respostas.length
        );
    }
}
